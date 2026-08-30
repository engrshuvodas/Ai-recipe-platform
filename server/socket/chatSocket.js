const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const jwt = require('jsonwebtoken');

const onlineUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(); // allow guest socket if any
    }
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'super_secret_recipe_companion_jwt_key_2026'
      );
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error('[Socket Auth Error]:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      onlineUsers.set(socket.userId, socket.id);
      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`[Socket] User connected: ${socket.userId}`);
    }

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // Real-time message sending
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, receiverId, text, media } = data;

        if (!socket.userId || !receiverId || !text) return;

        let convId = conversationId;
        if (!convId) {
          let conv = await Conversation.findOne({
            participants: { $all: [socket.userId, receiverId] },
          });
          if (!conv) {
            conv = await Conversation.create({
              participants: [socket.userId, receiverId],
              lastMessage: { text, sender: socket.userId, createdAt: new Date() },
            });
          }
          convId = conv._id;
        }

        const message = await Message.create({
          conversation: convId,
          sender: socket.userId,
          receiver: receiverId,
          text,
          media: media || '',
          isRead: false,
        });

        await Conversation.findByIdAndUpdate(convId, {
          lastMessage: { text, sender: socket.userId, createdAt: new Date() },
          updatedAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'name username avatar')
          .populate('receiver', 'name username avatar');

        // Emit to room
        io.to(convId.toString()).emit('receive_message', populated);

        // Also emit directly to receiver socket if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message_notification', {
            message: populated,
            conversationId: convId,
          });
        }
      } catch (err) {
        console.error('[Socket send_message error]:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, receiverId, userName }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', { conversationId, userName });
      }
    });

    socket.on('stop_typing', ({ conversationId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', { conversationId });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`[Socket] User disconnected: ${socket.userId}`);
      }
    });
  });
};

module.exports = initSocket;
