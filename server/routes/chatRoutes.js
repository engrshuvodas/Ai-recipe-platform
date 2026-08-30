const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/chat/conversations
// @desc    Get all conversations for the logged in user
router.get('/conversations', protect, async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate('participants', 'name username avatar bio')
      .populate('lastMessage.sender', 'name username')
      .sort({ updatedAt: -1 });

    // Calculate unread counts
    const convWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          receiver: req.user._id,
          isRead: false,
        });
        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    res.json({
      success: true,
      conversations: convWithUnread,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/chat/messages/:conversationId
// @desc    Get messages for a conversation
router.get('/messages/:conversationId', protect, async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/messages
// @desc    Send a message to another user
router.post('/messages', protect, async (req, res, next) => {
  try {
    const { receiverId, text, media } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ success: false, message: 'Receiver ID and text are required' });
    }

    if (receiverId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot chat with yourself' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        lastMessage: {
          text,
          sender: req.user._id,
          createdAt: new Date(),
        },
      });
    } else {
      conversation.lastMessage = {
        text,
        sender: req.user._id,
        createdAt: new Date(),
      };
      conversation.updatedAt = new Date();
      await conversation.save();
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      text,
      media: media || '',
      isRead: false,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name username avatar')
      .populate('receiver', 'name username avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage,
      conversationId: conversation._id,
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/chat/read/:conversationId
// @desc    Mark conversation messages as read
router.post('/read/:conversationId', protect, async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
