import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import {
  MessageSquare,
  Search,
  Send,
  User,
  CheckCheck,
  Sparkles,
  ArrowLeft,
  Circle,
} from 'lucide-react';

const Chat = () => {
  const { user, isAuthenticated } = useAuth();
  const { socket, isUserOnline, incomingMessage } = useSocket();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);

  // User Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please log in to use direct messaging');
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
      if (socket) {
        socket.emit('join_conversation', activeConversation._id);
      }
    }
    return () => {
      if (activeConversation && socket) {
        socket.emit('leave_conversation', activeConversation._id);
      }
    };
  }, [activeConversation]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    if (incomingMessage) {
      if (
        activeConversation &&
        (incomingMessage.conversation === activeConversation._id ||
          incomingMessage.conversation?._id === activeConversation._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === incomingMessage._id)) return prev;
          return [...prev, incomingMessage];
        });
      }
      fetchConversations();
    }
  }, [incomingMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await chatAPI.getConversations();
      setConversations(res.data.conversations || []);
      if (!activeConversation && res.data.conversations?.length > 0) {
        setActiveConversation(res.data.conversations[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await chatAPI.getMessages(convId);
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await authAPI.getUsers(query);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartChatWithUser = async (targetUser) => {
    setIsSearching(false);
    setSearchQuery('');

    // Check if conversation already exists
    const existing = conversations.find((c) =>
      c.participants?.some((p) => (typeof p === 'string' ? p : p._id) === targetUser._id)
    );

    if (existing) {
      setActiveConversation(existing);
    } else {
      // Mock temporary conversation object until first message is sent
      const tempConv = {
        _id: `temp_${targetUser._id}`,
        participants: [user, targetUser],
        lastMessage: null,
      };
      setActiveConversation(tempConv);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;

    const otherParticipant = activeConversation.participants?.find(
      (p) => (typeof p === 'string' ? p : p._id) !== user._id
    );

    if (!otherParticipant) return;

    const receiverId = typeof otherParticipant === 'string' ? otherParticipant : otherParticipant._id;
    const textToSend = messageText.trim();
    setMessageText('');

    if (socket) {
      socket.emit('send_message', {
        conversationId: activeConversation._id.startsWith('temp_') ? null : activeConversation._id,
        receiverId,
        text: textToSend,
      });
    }

    try {
      const res = await chatAPI.sendMessage({
        receiverId,
        text: textToSend,
      });

      setMessages((prev) => [...prev, res.data.message]);

      if (activeConversation._id.startsWith('temp_')) {
        fetchConversations();
      }
    } catch (err) {
      toast.error('Failed to deliver message');
    }
  };

  const getOtherParticipant = (conv) => {
    if (!conv || !conv.participants) return null;
    return conv.participants.find(
      (p) => (typeof p === 'string' ? p : p._id) !== user?._id
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="h-[78vh] rounded-3xl bg-white dark:bg-[#0e271f] border border-stone-200 dark:border-forest-800 shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* LEFT SIDEBAR: CONVERSATION LIST & SEARCH (4 COLS) */}
        <aside className="md:col-span-5 lg:col-span-4 border-r border-stone-200 dark:border-forest-800 flex flex-col justify-between bg-stone-50/50 dark:bg-forest-950/40">
          <div className="p-4 border-b border-stone-200 dark:border-forest-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gold-500" />
                <span>Direct Chats</span>
              </h2>
            </div>

            {/* Search Foodies Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Find chefs or foodies by name..."
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-forest-900 text-xs border border-stone-200 dark:border-forest-800 focus:outline-none focus:border-gold-500"
              />
            </div>
          </div>

          {/* Conversation / Search Stream */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isSearching ? (
              searchResults.length === 0 ? (
                <p className="text-center py-6 text-xs text-stone-400">No users found</p>
              ) : (
                searchResults.map((u) => {
                  const online = isUserOnline(u._id);
                  return (
                    <div
                      key={u._id}
                      onClick={() => handleStartChatWithUser(u)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-forest-900 hover:bg-forest-50 dark:hover:bg-forest-800 cursor-pointer border border-stone-200 dark:border-forest-800 transition-all"
                    >
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-10 h-10 rounded-2xl object-cover"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-forest-900 ${
                            online ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-stone-900 dark:text-cream-50 truncate">{u.name}</p>
                        <p className="text-[10px] text-stone-400 truncate">@{u.username}</p>
                      </div>
                    </div>
                  );
                })
              )
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 space-y-2">
                <p>No active conversations yet.</p>
                <p className="text-[11px] text-stone-500">Search above to chat with fellow foodies & chefs!</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                if (!other) return null;
                const isSelected = activeConversation?._id === conv._id;
                const online = isUserOnline(other._id);

                return (
                  <div
                    key={conv._id}
                    onClick={() => setActiveConversation(conv)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-forest-900 text-cream-50 dark:bg-forest-700 shadow-sm'
                        : 'bg-white dark:bg-forest-900/40 hover:bg-stone-100 dark:hover:bg-forest-900/80 border border-stone-200/60 dark:border-forest-800/60'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={other.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={other.name}
                        className="w-10 h-10 rounded-2xl object-cover"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-forest-900 ${
                          online ? 'bg-emerald-500' : 'bg-stone-400'
                        }`}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-cream-50' : 'text-stone-900 dark:text-cream-50'}`}>
                          {other.name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-500 text-forest-950">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        {conv.lastMessage?.text || 'Started conversation'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT PANEL: CHAT WINDOW STREAM (7-8 COLS) */}
        <main className="md:col-span-7 lg:col-span-8 flex flex-col justify-between h-full bg-white dark:bg-[#0e271f]">
          {activeConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const other = getOtherParticipant(activeConversation);
                const online = isUserOnline(other?._id);
                return (
                  <div className="p-4 border-b border-stone-200 dark:border-forest-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={other?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                          alt={other?.name}
                          className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gold-500/50"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-forest-900 ${
                            online ? 'bg-emerald-500' : 'bg-stone-400'
                          }`}
                        />
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-forest-900 dark:text-cream-50">
                          {other?.name || 'Fellow Foodie'}
                        </h3>
                        <p className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Circle className={`w-2 h-2 fill-current ${online ? 'text-emerald-500' : 'text-stone-400'}`} />
                          <span>{online ? 'Online now' : 'Offline'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Bubble Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-stone-50/40 dark:bg-forest-950/30">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-stone-400 space-y-2">
                    <Sparkles className="w-8 h-8 text-gold-400" />
                    <p className="text-xs font-semibold">Start the culinary conversation!</p>
                    <p className="text-[11px]">Ask for recipe recommendations, spice tips, or cooking secrets.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isMe = (typeof msg.sender === 'string' ? msg.sender : msg.sender?._id) === user._id;
                    return (
                      <div
                        key={i}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-forest-900 text-cream-50 dark:bg-gold-500 dark:text-forest-950 rounded-tr-none shadow-sm'
                              : 'bg-white dark:bg-forest-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-forest-800 rounded-tl-none shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-stone-400 mt-1 px-1">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-stone-200 dark:border-forest-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message or share cooking tips..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-2xl bg-stone-100 dark:bg-forest-950 border border-stone-200 dark:border-forest-800 text-xs focus:outline-none focus:border-gold-500 text-stone-900 dark:text-stone-100"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="p-3 rounded-2xl bg-forest-900 text-gold-400 dark:bg-gold-500 dark:text-forest-950 hover:scale-105 disabled:opacity-50 transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400 space-y-3">
              <MessageSquare className="w-12 h-12 text-gold-500/50" />
              <h3 className="font-serif font-bold text-lg text-forest-900 dark:text-cream-50">
                Select a conversation
              </h3>
              <p className="text-xs max-w-xs">
                Pick a chat from the left or search for chefs to start real-time messaging.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Chat;
