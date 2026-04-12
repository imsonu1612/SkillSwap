const jwt = require('jsonwebtoken');

const socketRoomForUser = (userId) => `user_${userId}`;
const socketRoomForChat = (userIdA, userIdB) => {
  const [first, second] = [userIdA.toString(), userIdB.toString()].sort();
  return `chat_${first}_${second}`;
};

const toPublicMessage = (messageDocument) => {
  const plain = messageDocument.toObject ? messageDocument.toObject() : messageDocument;
  return {
    id: plain._id || plain.id,
    sender: plain.sender?.getPublicProfile ? plain.sender.getPublicProfile() : plain.sender,
    receiver: plain.receiver,
    content: plain.content,
    status: plain.status,
    seenAt: plain.seenAt,
    isRead: plain.isRead,
    createdAt: plain.createdAt
  };
};

const setupSocketHandlers = (io, { User, Connection, Message }) => {
  const onlineUsers = new Set();

  const notifyDelivered = ({ senderId, receiverId, messageIds = [] }) => {
    if (!senderId || !receiverId || messageIds.length === 0) {
      return;
    }

    const normalizedMessageIds = messageIds.map((id) => id.toString());

    io.to(socketRoomForUser(senderId)).emit('message_delivered', {
      fromUserId: receiverId,
      toUserId: senderId,
      messageIds: normalizedMessageIds,
      messageId: normalizedMessageIds[0]
    });

    // Backward compatibility for existing clients.
    io.to(socketRoomForUser(senderId)).emit('message_status_update', {
      fromUserId: receiverId,
      toUserId: senderId,
      status: 'delivered',
      messageIds: normalizedMessageIds,
      messageId: normalizedMessageIds[0]
    });
  };

  const notifySeen = ({ senderId, receiverId, messageIds = [], seenAt }) => {
    if (!senderId || !receiverId || messageIds.length === 0) {
      return;
    }

    const normalizedMessageIds = messageIds.map((id) => id.toString());

    io.to(socketRoomForUser(senderId)).emit('message_seen_update', {
      fromUserId: receiverId,
      toUserId: senderId,
      seenAt,
      messageIds: normalizedMessageIds,
      messageId: normalizedMessageIds[0]
    });

    // Backward compatibility for existing clients.
    io.to(socketRoomForUser(senderId)).emit('message_seen', {
      fromUserId: receiverId,
      toUserId: senderId,
      seenAt,
      messageIds: normalizedMessageIds,
      messageId: normalizedMessageIds[0]
    });

    io.to(socketRoomForUser(senderId)).emit('message_status_update', {
      fromUserId: receiverId,
      toUserId: senderId,
      status: 'seen',
      seenAt,
      messageIds: normalizedMessageIds,
      messageId: normalizedMessageIds[0]
    });
  };

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id firstName lastName username avatar');

      if (!user) {
        return next(new Error('Invalid user'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    const userRoom = socketRoomForUser(userId);

    socket.join(userRoom);
    socket.data.userId = userId;
    onlineUsers.add(userId);

    // Optional enhancement: when user comes online, mark queued sent messages as delivered.
    Message.find({ receiver: userId, status: 'sent' })
      .select('_id sender')
      .then(async (pendingMessages) => {
        if (!pendingMessages.length) {
          return;
        }

        const deliveredAtConnectIds = pendingMessages.map((message) => message._id);
        await Message.updateMany(
          { _id: { $in: deliveredAtConnectIds } },
          { $set: { status: 'delivered' } }
        );

        const groupedBySender = pendingMessages.reduce((acc, message) => {
          const senderId = message.sender.toString();
          if (!acc[senderId]) {
            acc[senderId] = [];
          }
          acc[senderId].push(message._id.toString());
          return acc;
        }, {});

        Object.entries(groupedBySender).forEach(([senderId, messageIds]) => {
          notifyDelivered({ senderId, receiverId: userId, messageIds });
        });
      })
      .catch((error) => {
        console.error('Socket pending delivery sync error:', error);
      });

    socket.emit('online_users_snapshot', {
      onlineUserIds: Array.from(onlineUsers)
    });

    socket.broadcast.emit('user_online', {
      userId,
      online: true
    });

    socket.on('join_chat', ({ otherUserId }) => {
      if (!otherUserId) return;
      socket.join(socketRoomForChat(userId, otherUserId));
    });

    socket.on('send_message', async (payload, ack) => {
      try {
        const receiverId = payload?.receiverId;
        const content = (payload?.content || '').trim();

        if (!receiverId || !content) {
          return ack?.({ success: false, message: 'Receiver and content are required' });
        }

        const connection = await Connection.findOne({
          $or: [
            { user1: userId, user2: receiverId },
            { user1: receiverId, user2: userId }
          ]
        });

        if (!connection) {
          return ack?.({ success: false, message: 'You can only send messages to connected users' });
        }

        const message = await Message.create({
          sender: userId,
          receiver: receiverId,
          content,
          status: 'sent',
          isRead: false,
          seenAt: null
        });

        await message.populate('sender', 'firstName lastName username avatar');

        const messagePayload = toPublicMessage(message);
        const receiverRoom = socketRoomForUser(receiverId);
        const receiverSockets = io.sockets.adapter.rooms.get(receiverRoom);
        const isReceiverOnline = Boolean(receiverSockets && receiverSockets.size > 0);

        if (isReceiverOnline) {
          message.status = 'delivered';
          await message.save();
          messagePayload.status = 'delivered';
          io.to(receiverRoom).emit('receive_message', messagePayload);
          notifyDelivered({
            senderId: userId,
            receiverId,
            messageIds: [message._id]
          });
        } else {
          io.to(userRoom).emit('message_status_update', {
            messageId: message._id,
            status: 'sent'
          });
        }

        return ack?.({ success: true, message: messagePayload });
      } catch (error) {
        console.error('Socket send_message error:', error);
        return ack?.({ success: false, message: 'Failed to send message' });
      }
    });

    socket.on('typing', ({ toUserId }) => {
      if (!toUserId) return;
      io.to(socketRoomForUser(toUserId)).emit('typing', {
        fromUserId: userId,
        roomUserId: toUserId
      });
    });

    socket.on('stop_typing', ({ toUserId }) => {
      if (!toUserId) return;
      io.to(socketRoomForUser(toUserId)).emit('stop_typing', {
        fromUserId: userId,
        roomUserId: toUserId
      });
    });

    socket.on('message_seen', async ({ otherUserId, messageId, messageIds }) => {
      try {
        if (!otherUserId) return;

        const explicitMessageIds = [
          ...(Array.isArray(messageIds) ? messageIds : []),
          ...(messageId ? [messageId] : [])
        ].map((id) => id.toString());

        const query = {
          sender: otherUserId,
          receiver: userId,
          status: { $ne: 'seen' }
        };

        if (explicitMessageIds.length > 0) {
          query._id = { $in: explicitMessageIds };
        }

        const updatedMessages = await Message.find(query).select('_id');

        if (updatedMessages.length === 0) {
          return;
        }

        const now = new Date();
        await Message.updateMany(
          { _id: { $in: updatedMessages.map((message) => message._id) } },
          {
            $set: {
              status: 'seen',
              isRead: true,
              seenAt: now
            }
          }
        );

        notifySeen({
          senderId: otherUserId,
          receiverId: userId,
          seenAt: now,
          messageIds: updatedMessages.map((message) => message._id.toString())
        });
      } catch (error) {
        console.error('Socket message_seen error:', error);
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      socket.broadcast.emit('user_online', {
        userId,
        online: false
      });
    });
  });
};

module.exports = {
  setupSocketHandlers,
  socketRoomForUser,
  socketRoomForChat,
  toPublicMessage
};
