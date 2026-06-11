import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User, Check, CheckCheck, MoreVertical, Trash2, Copy, Reply, Search, Smile, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { connectSocket } from '../../services/socket';

const normalizeId = (value) => String(value || '');
const emojiOptions = ['😀', '😂', '😍', '👍', '🎉', '🙏', '🔥', '✨', '💡', '🚀'];

const ChatRoom = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUnreadMessages } = useNotifications();
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const composerRef = useRef(null);
  const { userName } = location.state || {};

  const filteredMessages = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return messages;
    }

    return messages.filter((message) => {
      const senderName = `${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`.toLowerCase();
      const content = (message.content || '').toLowerCase();
      const replyContent = (message.replyTo?.content || '').toLowerCase();

      return senderName.includes(query) || content.includes(query) || replyContent.includes(query);
    });
  }, [messages, searchQuery]);

  const isMessageHiddenForViewer = useCallback((message) => {
    const viewerId = normalizeId(currentUser?._id);
    const deletedFor = Array.isArray(message.deletedFor)
      ? message.deletedFor.map(normalizeId)
      : [];

    return Boolean(
      message.deletedForEveryone ||
      (viewerId && deletedFor.includes(viewerId))
    );
  }, [currentUser?._id]);

  const emitMessageSeen = useCallback((messageList) => {
    const unreadIncomingIds = messageList
      .filter(
        (message) => normalizeId(message.sender?._id || message.sender?.id || message.sender) === normalizeId(userId)
          && message.status !== 'seen'
      )
      .map((message) => normalizeId(message.id));

    if (unreadIncomingIds.length > 0) {
      socketRef.current?.emit('message_seen', {
        otherUserId: userId,
        messageIds: unreadIncomingIds
      });
    }
  }, [userId]);

  const applyStatusUpdate = useCallback((payload, fallbackStatus = null) => {
    const nextStatus = payload?.status || fallbackStatus;
    if (!nextStatus) {
      return;
    }

    const messageIds = [
      ...(payload?.messageIds || []),
      ...(payload?.messageId ? [payload.messageId] : [])
    ].map(normalizeId);

    if (messageIds.length === 0) {
      return;
    }

    setMessages((currentMessages) => currentMessages.map((message) => {
      if (!messageIds.includes(normalizeId(message.id))) {
        return message;
      }

      return {
        ...message,
        status: nextStatus,
        seenAt: payload?.seenAt || message.seenAt,
        isRead: nextStatus === 'seen' ? true : message.isRead
      };
    }));
  }, []);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/connections/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setReplyToMessage(null);
        setOpenMenuId(null);
        setUnreadMessages(0);
        emitMessageSeen(data.messages || []);
      } else {
        const errorData = await response.json();
        if (response.status === 403) {
          toast.error('You can only chat with connected users');
          navigate('/connections');
        } else {
          console.error('Failed to fetch messages:', errorData);
        }
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [emitMessageSeen, navigate, setUnreadMessages, userId]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket = connectSocket();
    socketRef.current = socket;

    if (!socket) {
      setIsUserOnline(false);
      return undefined;
    }

    if (token) {
      socket.auth = { token };
      if (!socket.connected) {
        socket.connect();
      }
    }

    socket.on('online_users_snapshot', ({ onlineUserIds = [] } = {}) => {
      setIsUserOnline(onlineUserIds.map(normalizeId).includes(normalizeId(userId)));
    });

    socket.on('user_online', ({ userId: updatedUserId, online }) => {
      if (normalizeId(updatedUserId) === normalizeId(userId)) {
        setIsUserOnline(Boolean(online));
      }
    });

    const handleReceiveMessage = (message) => {
      const receiverId = normalizeId(message?.receiver);

      const senderId = normalizeId(message?.sender?._id || message?.sender?.id || message?.sender);

      if (senderId === normalizeId(userId) || receiverId === normalizeId(userId)) {
        setMessages((currentMessages) => {
          if (currentMessages.some((item) => normalizeId(item.id) === normalizeId(message.id))) {
            return currentMessages.map((item) => (
              normalizeId(item.id) === normalizeId(message.id) ? { ...item, ...message } : item
            ));
          }

          return [...currentMessages, message];
        });
      }
    };

    const handleMessageDeleted = (payload) => {
      if (!payload?.id) return;

      setMessages((currentMessages) => currentMessages.map((item) => (
        normalizeId(item.id) === normalizeId(payload.id)
          ? { ...item, ...payload }
          : item
      )));
    };

    const handleMessageStatusUpdate = (payload) => {
      applyStatusUpdate(payload);
    };

    const handleMessageDelivered = (payload) => {
      applyStatusUpdate(payload, 'delivered');
    };

    const handleTyping = ({ fromUserId }) => {
      if (normalizeId(fromUserId) === normalizeId(userId)) {
        setIsOtherTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 2000);
      }
    };

    const handleStopTyping = ({ fromUserId }) => {
      if (normalizeId(fromUserId) === normalizeId(userId)) {
        setIsOtherTyping(false);
      }
    };

    const handleMessageSeenUpdate = (payload) => {
      applyStatusUpdate(payload, 'seen');
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('message_delivered', handleMessageDelivered);
    socket.on('message_deleted', handleMessageDeleted);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_seen_update', handleMessageSeenUpdate);
    socket.on('message_seen', handleMessageSeenUpdate);
    socket.emit('join_chat', { otherUserId: userId });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('message_delivered', handleMessageDelivered);
      socket.off('message_deleted', handleMessageDeleted);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_seen_update', handleMessageSeenUpdate);
      socket.off('message_seen', handleMessageSeenUpdate);
      socket.off('online_users_snapshot');
      socket.off('user_online');
      socket.emit('stop_typing', { toUserId: userId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [applyStatusUpdate, userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const clickedInsideMenu = target.closest('[data-message-menu-panel], [data-message-menu-trigger]');
      const clickedInsideEmojiPicker = target.closest('[data-emoji-picker-panel], [data-emoji-picker-trigger]');

      if (!clickedInsideMenu && openMenuId) {
        setOpenMenuId(null);
      }

      if (!clickedInsideEmojiPicker && showEmojiPicker) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [openMenuId, showEmojiPicker]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const emitTyping = () => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    socket.emit('typing', { toUserId: userId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { toUserId: userId });
    }, 1000);
  };

  const updateMessageList = (message) => {
    setMessages((currentMessages) => {
      if (currentMessages.some((item) => normalizeId(item.id) === normalizeId(message.id))) {
        return currentMessages.map((item) => (
          normalizeId(item.id) === normalizeId(message.id) ? { ...item, ...message } : item
        ));
      }

      return [...currentMessages, message];
    });
  };

  const sendViaSocket = (content, replyToMessageId = null) => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        resolve({ success: false });
        return;
      }

      socket.emit('send_message', { receiverId: userId, content, replyToMessageId }, (response) => {
        resolve(response || { success: false });
      });
    });
  };

  const handleCopyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message.content || '');
      toast.success('Message copied');
    } catch (error) {
      toast.error('Unable to copy message');
    }
  };

  const handleDeleteMessage = async (deleteFor) => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ deleteFor })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete message');
      }

      if (data.data) {
        setMessages((currentMessages) => currentMessages.map((message) => (
          normalizeId(message.id) === normalizeId(data.data.id)
            ? { ...message, ...data.data }
            : message
        )));
      }

      toast.success(deleteFor === 'everyone' ? 'Message deleted for everyone' : 'Message deleted for you');
      setDeleteTarget(null);
      setOpenMenuId(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInsertEmoji = (emoji) => {
    setNewMessage((current) => `${current}${emoji}`);
    setShowEmojiPicker(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const content = newMessage.trim();
    if (!content) return;

    setIsSending(true);
    try {
      const response = await sendViaSocket(content, replyToMessage?.id);

      if (response.success && response.message) {
        updateMessageList(response.message);
        setNewMessage('');
        setReplyToMessage(null);
        setShowEmojiPicker(false);
        socketRef.current?.emit('stop_typing', { toUserId: userId });
      } else {
        const fallbackResponse = await fetch('/api/connections/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            receiverId: userId,
            content,
            replyToMessageId: replyToMessage?.id || null
          })
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          if (data.data) {
            updateMessageList(data.data);
          }
          setNewMessage('');
          setReplyToMessage(null);
        } else {
          const data = await fallbackResponse.json();
          toast.error(data.message || 'Failed to send message');
        }
      }
    } catch (error) {
      console.error('Send message error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderStatus = (status) => {
    if (status === 'seen') {
      return <CheckCheck className="h-4 w-4 text-blue-500" />;
    }

    if (status === 'delivered') {
      return <CheckCheck className="h-4 w-4 text-gray-400" />;
    }

    return <Check className="h-4 w-4 text-gray-400" />;
  };

  const getSeenAtLabel = (message) => {
    if (message.status !== 'seen' || !message.seenAt) {
      return null;
    }

    return `Seen at ${new Date(message.seenAt).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`;
  };

  const formatTimestamp = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderReplyPreview = (message, compact = false) => {
    if (!message?.replyTo) return null;

    const replyContent = message.replyTo.content || 'This message was deleted';

    return (
      <div className={`mb-2 rounded-xl border-l-4 border-blue-300/70 bg-white/10 px-3 py-2 text-xs ${compact ? 'max-w-full' : ''}`}>
        <div className="mb-1 font-medium opacity-80">
          Replying to {message.replyTo.sender?.firstName || 'User'}
        </div>
        <div className="truncate opacity-90">{replyContent}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
      <div className="mx-auto flex h-[calc(100vh-4rem)] w-full max-w-6xl flex-col overflow-hidden md:px-4 md:py-4">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/connections')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-500/20">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {userName || 'Chat'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {isUserOnline && <span className="h-2 w-2 rounded-full bg-green-500" />}
                    <span>{isUserOnline ? 'Online' : 'Offline'}</span>
                  </span>
                  {isOtherTyping && <span>Typing...</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages"
                  className="w-full rounded-full border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-3 py-4 dark:bg-gray-950/80 sm:px-4">
          {filteredMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center px-4">
              <div className="max-w-md rounded-3xl border border-dashed border-gray-300 bg-white/80 p-8 text-center shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-500/20">
                  <Send className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {searchQuery ? 'No matching messages' : 'No messages yet'}
                </h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  {searchQuery
                    ? 'Try a different keyword, sender name, or reply text.'
                    : 'Start the conversation by sending the first message.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {filteredMessages.map((message) => {
                const senderId = normalizeId(message.sender?._id || message.sender?.id || message.sender);
                const isMine = senderId === normalizeId(currentUser?._id);
                const isDeleted = isMessageHiddenForViewer(message);

                return (
                  <div
                    key={message.id}
                    className={`group flex ${isMine ? 'justify-end' : 'justify-start'} transition-all duration-300`}
                  >
                    <div
                      className={`relative max-w-[88%] rounded-2xl border px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:max-w-lg ${
                        isMine
                          ? 'border-blue-500/20 bg-blue-600 text-white dark:bg-blue-500'
                          : 'border-gray-200 bg-gray-100 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <div className={`text-xs font-semibold ${isMine ? 'text-white/90' : 'text-gray-800 dark:text-gray-100'}`}>
                          {message.sender?.firstName} {message.sender?.lastName}
                        </div>
                        <div className={`text-[11px] ${isMine ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                          {formatTimestamp(message.createdAt)}
                        </div>
                      </div>

                      {renderReplyPreview(message)}

                      <div className={`text-sm leading-relaxed ${isMine ? 'text-white' : 'text-gray-900 dark:text-gray-100'} whitespace-pre-wrap`}>
                        {isDeleted ? 'This message was deleted' : message.content}
                      </div>

                      {isMine && !isDeleted && (
                        <div className="mt-2 flex flex-col items-end gap-0.5">
                          <div className="flex items-center justify-end gap-2">
                            {renderStatus(message.status)}
                            {getSeenAtLabel(message) && (
                              <span className="text-[10px] text-white/70">{getSeenAtLabel(message)}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setOpenMenuId(message.id)}
                        data-message-menu-trigger
                        className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/10 text-current opacity-0 transition-all duration-300 hover:bg-black/20 group-hover:opacity-100 dark:bg-white/10 dark:hover:bg-white/20"
                        aria-label="Message actions"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {openMenuId === message.id && (
                        <div data-message-menu-panel className="absolute right-2 top-11 z-20 w-40 overflow-hidden rounded-2xl border border-gray-200 bg-white p-1 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyToMessage(message);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Reply className="h-4 w-4" />
                            Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              handleCopyMessage(message);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-300 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <Copy className="h-4 w-4" />
                            Copy
                          </button>
                          {(isMine || !isDeleted) && (
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(message);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-red-600 transition-colors duration-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div ref={composerRef} className="border-t border-gray-200 bg-white/95 px-4 py-4 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
          {replyToMessage && (
            <div className="mb-3 flex items-start justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-100">
              <div className="min-w-0">
                <div className="font-medium">Replying to {replyToMessage.sender?.firstName} {replyToMessage.sender?.lastName}</div>
                <div className="truncate text-xs opacity-80">
                  {replyToMessage.content || 'This message was deleted'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyToMessage(null)}
                className="rounded-full p-1 transition-colors duration-300 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Cancel reply"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <form onSubmit={sendMessage} className="flex items-end gap-3">
            <button
              type="button"
              onClick={() => setShowEmojiPicker((current) => !current)}
              data-emoji-picker-trigger
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:hidden"
              aria-label="Emoji picker"
            >
              <Smile className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  emitTyping();
                }}
                placeholder="Type your message..."
                className="h-12 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-900 outline-none transition-all duration-300 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                disabled={isSending}
              />

              {showEmojiPicker && (
                  <div
                    data-emoji-picker-panel
                    className="absolute bottom-14 left-1/2 z-20 grid w-[calc(100vw-2rem)] max-w-72 -translate-x-1/2 grid-cols-5 gap-1.5 rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:w-auto sm:max-w-none sm:translate-x-0 sm:gap-2 sm:p-3"
                  >
                  {emojiOptions.map((emoji) => (
                    <button
                      key={`picker-${emoji}`}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                        className="rounded-xl px-2 py-2 text-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 sm:px-3 sm:py-2.5"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 sm:w-auto sm:px-5"
            >
              {isSending ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete message?</h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this message?
            </p>

            <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200">
              {deleteTarget.content || 'This message was deleted'}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage('me')}
                className="rounded-2xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                disabled={isDeleting}
              >
                Delete for Me
              </button>
              <button
                type="button"
                onClick={() => handleDeleteMessage('everyone')}
                className="rounded-2xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-300 hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                Delete for Everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;
