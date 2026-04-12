const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ConnectionRequest = require('../models/ConnectionRequest');
const Connection = require('../models/Connection');
const Message = require('../models/Message');
const { sendConnectionRequestEmail, sendConnectionAcceptedEmail } = require('../services/emailService');
const { toPublicMessage, socketRoomForUser } = require('../services/socket');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'Invalid token'
    });
  }
};

// Send connection request
router.post('/request', authenticateToken, [
  body('toUserId')
    .notEmpty()
    .withMessage('Target user ID is required'),
  body('message')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Message cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { toUserId, message } = req.body;
    const fromUserId = req.userId;

    // Prevent self-connection requests
    if (fromUserId === toUserId) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'You cannot send a connection request to yourself'
      });
    }

    // Check if users exist
    const [fromUser, toUser] = await Promise.all([
      User.findById(fromUserId),
      User.findById(toUserId)
    ]);

    if (!fromUser || !toUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'One or both users do not exist'
      });
    }

    // Check if already connected
    const existingConnection = await Connection.findOne({
      $or: [
        { user1: fromUserId, user2: toUserId },
        { user1: toUserId, user2: fromUserId }
      ]
    });

    if (existingConnection) {
      return res.status(400).json({
        error: 'Already connected',
        message: 'You are already connected with this user'
      });
    }

    // Check if request already exists
    const existingRequest = await ConnectionRequest.findOne({
      from: fromUserId,
      to: toUserId
    });

    if (existingRequest) {
      return res.status(400).json({
        error: 'Request already sent',
        message: 'You have already sent a connection request to this user'
      });
    }

    // Create connection request
    const connectionRequest = new ConnectionRequest({
      from: fromUserId,
      to: toUserId,
      message: message || ''
    });

    await connectionRequest.save();

    // Send email notification
    try {
      await sendConnectionRequestEmail(
        toUser.email,
        toUser.firstName,
        fromUser.firstName,
        message
      );
    } catch (emailError) {
      console.error('Failed to send connection request email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      message: 'Connection request sent successfully',
      request: {
        id: connectionRequest._id,
        from: fromUser.getPublicProfile(),
        to: toUser.getPublicProfile(),
        message: connectionRequest.message,
        status: connectionRequest.status,
        createdAt: connectionRequest.createdAt
      }
    });

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        error: 'Request already sent',
        message: 'A pending request already exists for this user pair'
      });
    }

    console.error('Connection request error:', error);
    res.status(500).json({
      error: 'Failed to send connection request',
      message: 'Something went wrong while sending the request'
    });
  }
});

// Get pending connection requests
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      to: req.userId,
      status: 'pending'
    }).populate('from', 'firstName lastName username email avatar');

    res.json({
      requests: requests.map(req => ({
        id: req._id,
        from: req.from.getPublicProfile(),
        message: req.message,
        createdAt: req.createdAt
      }))
    });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      error: 'Failed to fetch requests',
      message: 'Something went wrong while fetching requests'
    });
  }
});

// Accept connection request
router.post('/accept/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await ConnectionRequest.findById(requestId).populate('from to');

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'Connection request does not exist'
      });
    }

    // Fix: Compare ObjectId values properly
    if (request.to._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only accept requests sent to you'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'This request has already been processed'
      });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Create connection
    const connection = new Connection({
      user1: request.from._id,
      user2: request.to._id
    });
    await connection.save();

    // Send email notification to the requester
    try {
      await sendConnectionAcceptedEmail(
        request.from.email,
        request.from.firstName,
        request.to.firstName
      );
    } catch (emailError) {
      console.error('Failed to send connection accepted email:', emailError);
    }

    res.json({
      message: 'Connection request accepted successfully',
      connection: {
        id: connection._id,
        user1: request.from.getPublicProfile(),
        user2: request.to.getPublicProfile(),
        connectedAt: connection.connectedAt
      }
    });

  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({
      error: 'Failed to accept request',
      message: 'Something went wrong while accepting the request'
    });
  }
});

// Reject connection request
router.post('/reject/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await ConnectionRequest.findById(requestId).populate('from to');

    if (!request) {
      return res.status(404).json({
        error: 'Request not found',
        message: 'Connection request does not exist'
      });
    }

    // Fix: Compare ObjectId values properly
    if (request.to._id.toString() !== userId) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only reject requests sent to you'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'This request has already been processed'
      });
    }

    // Update request status
    request.status = 'rejected';
    await request.save();

    res.json({
      message: 'Connection request rejected successfully'
    });

  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      error: 'Failed to reject request',
      message: 'Something went wrong while rejecting the request'
    });
  }
});

// Get user connections
router.get('/', authenticateToken, async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [
        { user1: req.userId },
        { user2: req.userId }
      ]
    })
      .sort({ connectedAt: -1 })
      .populate('user1 user2', 'firstName lastName username avatar location skills lastActive');

    const formattedConnections = connections.map(conn => ({
      id: conn._id,
      user: conn.user1._id.toString() === req.userId ? 
        conn.user2.getPublicProfile() : 
        conn.user1.getPublicProfile(),
      connectedAt: conn.connectedAt
    }));

    res.json({ connections: formattedConnections });
  } catch (error) {
    console.error('Get connections error:', error);
    res.status(500).json({
      error: 'Failed to fetch connections',
      message: 'Something went wrong'
    });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    // Get recent connection requests
    const requests = await ConnectionRequest.find({
      to: req.userId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .populate('from', 'firstName lastName username')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get recent accepted connections
    const connections = await Connection.find({
      $or: [{ user1: req.userId }, { user2: req.userId }],
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    })
    .populate('user1 user2', 'firstName lastName username')
    .sort({ createdAt: -1 })
    .limit(5);

    // Format activities
    const requestActivities = requests.map(req => ({
      type: 'connection_request',
      user: req.from.getPublicProfile(),
      createdAt: req.createdAt
    }));

    const connectionActivities = connections.map(conn => ({
      type: 'connection_accepted',
      user: conn.user1._id.toString() === req.userId ? 
        conn.user2.getPublicProfile() : 
        conn.user1.getPublicProfile(),
      createdAt: conn.createdAt
    }));

    // Combine and sort activities
    const allActivities = [...requestActivities, ...connectionActivities]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10); // Get most recent 10 activities

    res.json({ activity: allActivities });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      error: 'Failed to fetch activity',
      message: 'Something went wrong'
    });
  }
});

// Send message
router.post('/message', authenticateToken, [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required'),
  body('content')
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { receiverId, content } = req.body;
    const senderId = req.userId;

    // Check if users are connected
    const connection = await Connection.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        error: 'Not connected',
        message: 'You can only send messages to connected users'
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      status: 'sent'
    });

    await message.save();

    // Populate sender info
    await message.populate('sender', 'firstName lastName username avatar');

    const io = req.app.get('io');
    const receiverRoom = socketRoomForUser(receiverId);
    const receiverSockets = io?.sockets?.adapter?.rooms?.get(receiverRoom);
    const isReceiverOnline = Boolean(receiverSockets && receiverSockets.size > 0);

    if (isReceiverOnline) {
      message.status = 'delivered';
      await message.save();
      io.to(receiverRoom).emit('receive_message', toPublicMessage(message));
      io.to(socketRoomForUser(senderId)).emit('message_delivered', {
        fromUserId: receiverId,
        toUserId: senderId,
        messageId: message._id,
        messageIds: [message._id.toString()]
      });
      io.to(socketRoomForUser(senderId)).emit('message_status_update', {
        fromUserId: receiverId,
        toUserId: senderId,
        messageId: message._id,
        messageIds: [message._id.toString()],
        status: 'delivered'
      });
    }

    res.status(201).json({
      message: 'Message sent successfully',
      data: toPublicMessage(message)
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      error: 'Failed to send message',
      message: 'Something went wrong while sending the message'
    });
  }
});

// Get messages with a user
router.get('/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;

    // Check if users are connected
    const connection = await Connection.findOne({
      $or: [
        { user1: currentUserId, user2: userId },
        { user1: userId, user2: currentUserId }
      ]
    });

    if (!connection) {
      return res.status(403).json({
        error: 'Not connected',
        message: 'You can only view messages with connected users'
      });
    }

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'firstName lastName username avatar');

    // Mark incoming messages as delivered when chat is opened.
    const pendingIncomingMessages = await Message.find({
      sender: userId,
      receiver: currentUserId,
      status: 'sent'
    }).select('_id sender');

    if (pendingIncomingMessages.length > 0) {
      const pendingIds = pendingIncomingMessages.map((message) => message._id);

      await Message.updateMany(
        {
          _id: { $in: pendingIds }
        },
        {
          $set: {
            status: 'delivered'
          }
        }
      );

      const io = req.app.get('io');
      const senderRoom = socketRoomForUser(userId);
      const deliveredIds = pendingIds.map((id) => id.toString());

      io?.to(senderRoom).emit('message_delivered', {
        fromUserId: currentUserId,
        toUserId: userId,
        messageId: deliveredIds[0],
        messageIds: deliveredIds
      });

      io?.to(senderRoom).emit('message_status_update', {
        fromUserId: currentUserId,
        toUserId: userId,
        status: 'delivered',
        messageId: deliveredIds[0],
        messageIds: deliveredIds
      });
    }

    res.json({
      messages: messages.map((msg) => {
        const plain = msg.toObject();

        if (String(plain.sender?._id || plain.sender) === String(userId) && String(plain.receiver) === String(currentUserId) && plain.status === 'sent') {
          plain.status = 'delivered';
        }

        return {
          id: plain._id,
          sender: msg.sender.getPublicProfile(),
          receiver: plain.receiver,
          content: plain.content,
          status: plain.status,
          seenAt: plain.seenAt,
          isRead: plain.isRead,
          createdAt: plain.createdAt
        };
      })
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      error: 'Failed to fetch messages',
      message: 'Something went wrong while fetching messages'
    });
  }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.userId,
      isRead: false
    });

    res.json({
      unreadCount: count
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      error: 'Failed to fetch unread count',
      message: 'Something went wrong while fetching unread count'
    });
  }
});

// Get connection status with a user
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currentUserId = req.userId;

    // Check if already connected
    const existingConnection = await Connection.findOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    // Check if request is pending
    const pendingRequest = await ConnectionRequest.findOne({
      from: currentUserId,
      to: targetUserId,
      status: 'pending'
    });

    res.json({
      isConnected: !!existingConnection,
      isPending: !!pendingRequest
    });

  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({
      error: 'Failed to fetch connection status',
      message: 'Something went wrong'
    });
  }
});

module.exports = router;