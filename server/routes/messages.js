const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const { socketRoomForUser, toPublicMessage } = require('../services/socket');
const Connection = require('../models/Connection');

const router = express.Router();

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

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteFor = req.body?.deleteFor || 'me';
    const currentUserId = req.userId;

    const message = await Message.findById(id)
      .populate('sender', 'firstName lastName username avatar')
      .populate('receiver', 'firstName lastName username avatar')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'firstName lastName username avatar'
        }
      });

    if (!message) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Message not found'
      });
    }

    const senderId = String(message.sender._id || message.sender);
    const receiverId = String(message.receiver._id || message.receiver);
    const isParticipant = senderId === String(currentUserId) || receiverId === String(currentUserId);

    const connection = await Connection.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId }
      ]
    });

    if (!isParticipant || !connection) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'You can only delete your own chat messages'
      });
    }

    if (deleteFor === 'everyone' && senderId !== String(currentUserId)) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Only the sender can delete a message for everyone'
      });
    }

    const deletedFor = new Set((message.deletedFor || []).map((value) => String(value)));
    deletedFor.add(String(currentUserId));

    message.deletedFor = Array.from(deletedFor);
    message.deletedAt = message.deletedAt || new Date();

    if (deleteFor === 'everyone') {
      deletedFor.add(senderId);
      deletedFor.add(receiverId);
      message.deletedForEveryone = true;
      message.isDeleted = true;
      message.deletedFor = Array.from(deletedFor);
      message.deletedAt = new Date();
    }

    await message.save();

    const io = req.app.get('io');
    const payload = toPublicMessage(message, currentUserId);

    if (deleteFor === 'everyone') {
      io?.to(socketRoomForUser(senderId)).emit('message_deleted', payload);
      io?.to(socketRoomForUser(receiverId)).emit('message_deleted', payload);
    } else {
      io?.to(socketRoomForUser(currentUserId)).emit('message_deleted', payload);
    }

    res.json({
      message: 'Message deleted successfully',
      data: payload
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      error: 'Failed to delete message',
      message: 'Something went wrong while deleting the message'
    });
  }
});

module.exports = router;