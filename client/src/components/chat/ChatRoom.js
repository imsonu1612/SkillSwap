import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { connectSocket } from '../../services/socket';

const normalizeId = (value) => String(value || '');

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
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socketRef = useRef(null);
  const { userName } = location.state || {};

  const emitMessageSeen = useCallback((messageList) => {
    const hasUnreadIncoming = messageList.some(
      (message) => normalizeId(message.sender?._id || message.sender?.id || message.sender) === normalizeId(userId)
        && message.status !== 'seen'
    );

    if (hasUnreadIncoming) {
      socketRef.current?.emit('message_seen', { otherUserId: userId });
    }
  }, [userId]);

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

    const handleMessageStatusUpdate = (payload) => {
      const messageIds = payload?.messageIds || (payload?.messageId ? [payload.messageId] : []);
      if (messageIds.length === 0) return;

      setMessages((currentMessages) => currentMessages.map((message) => {
        if (!messageIds.includes(normalizeId(message.id))) {
          return message;
        }

        return {
          ...message,
          status: payload.status,
          seenAt: payload.seenAt || message.seenAt,
          isRead: payload.status === 'seen' ? true : message.isRead
        };
      }));
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

    const handleMessageSeen = ({ fromUserId, messageIds, seenAt }) => {
      if (normalizeId(fromUserId) !== normalizeId(userId)) {
        return;
      }

      setMessages((currentMessages) => currentMessages.map((message) => {
        if (!messageIds?.includes(normalizeId(message.id))) {
          return message;
        }

        return {
          ...message,
          status: 'seen',
          isRead: true,
          seenAt
        };
      }));
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_status_update', handleMessageStatusUpdate);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_seen', handleMessageSeen);
    socket.emit('join_chat', { otherUserId: userId });

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_status_update', handleMessageStatusUpdate);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_seen', handleMessageSeen);
      socket.off('online_users_snapshot');
      socket.off('user_online');
      socket.emit('stop_typing', { toUserId: userId });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [userId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

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

  const sendViaSocket = (content) => {
    return new Promise((resolve) => {
      const socket = socketRef.current;
      if (!socket?.connected) {
        resolve({ success: false });
        return;
      }

      socket.emit('send_message', { receiverId: userId, content }, (response) => {
        resolve(response || { success: false });
      });
    });
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    const content = newMessage.trim();
    if (!content) return;

    setIsSending(true);
    try {
      const response = await sendViaSocket(content);

      if (response.success && response.message) {
        updateMessageList(response.message);
        setNewMessage('');
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
            content
          })
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          if (data.data) {
            updateMessageList(data.data);
          }
          setNewMessage('');
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/connections')}
          className="btn-secondary p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {userName || 'Chat'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-2 py-0.5 text-xs font-medium ${isUserOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
              >
                <span className={`h-2 w-2 rounded-full ${isUserOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                {isUserOnline ? 'Online' : 'Offline'}
              </span>
              <span>•</span>
              <span>{isOtherTyping ? 'User is typing...' : `${messages.length} messages`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const senderId = normalizeId(message.sender?._id || message.sender?.id || message.sender);
            const isMine = senderId === normalizeId(currentUser?._id);

            return (
              <div
                key={message.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMine
                      ? 'bg-primary-600 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs opacity-75">
                      {message.sender?.firstName} {message.sender?.lastName}
                    </span>
                    <span className="text-xs opacity-50">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {isMine && (
                    <div className="mt-1 flex justify-end">
                      {renderStatus(message.status)}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              emitTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="btn-primary px-6 disabled:opacity-50"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
