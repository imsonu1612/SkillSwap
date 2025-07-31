import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNotifications } from '../../contexts/NotificationContext';

const ChatRoom = () => {
  const { userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { setUnreadMessages } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { userName } = location.state || {};

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/connections/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        // Reset unread messages when entering chat
        setUnreadMessages(0);
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
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/connections/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          receiverId: userId,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to send message');
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
            <p className="text-sm text-gray-500">
              {messages.length} messages
            </p>
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
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender._id === userId ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender._id === userId
                    ? 'bg-white border border-gray-200'
                    : 'bg-primary-600 text-white'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs opacity-75">
                    {message.sender.firstName} {message.sender.lastName}
                  </span>
                  <span className="text-xs opacity-50">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
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