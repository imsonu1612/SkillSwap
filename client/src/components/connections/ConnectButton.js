import React, { useState, useEffect } from 'react';
import { Send, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ConnectButton = ({ targetUserId, targetUserName, onConnect }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    checkConnectionStatus();
  }, [targetUserId]);

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch('/api/connections/status/' + targetUserId, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setIsConnected(data.isConnected);
      setIsPending(data.isPending);
    } catch (error) {
      console.error('Status check error:', error);
    }
  };

  const handleConnect = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/connections/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          toUserId: targetUserId,
          message: message.trim()
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Connection request sent successfully!');
        setShowModal(false);
        setMessage('');
        setIsPending(true);
        if (onConnect) onConnect();
      } else {
        toast.error(data.message || 'Failed to send connection request');
      }
    } catch (error) {
      console.error('Connect error:', error);
      toast.error('Failed to send connection request');
    } finally {
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <button
        disabled
        className="btn-secondary flex items-center gap-2 opacity-75"
      >
        <Check className="h-4 w-4" />
        Connected
      </button>
    );
  }

  if (isPending) {
    return (
      <button
        disabled
        className="btn-secondary flex items-center gap-2 opacity-75"
      >
        <Send className="h-4 w-4" />
        Request Pending
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary flex items-center gap-2"
      >
        <Send className="h-4 w-4" />
        Connect
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Send Connection Request
            </h3>
            
            <p className="text-gray-600 mb-4">
              Send a connection request to <strong>{targetUserName}</strong>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hi! I'd like to connect with you..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="3"
                maxLength="200"
              />
              <p className="text-xs text-gray-500 mt-1">
                {message.length}/200 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConnectButton;