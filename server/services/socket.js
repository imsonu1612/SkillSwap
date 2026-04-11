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
          io.to(userRoom).emit('message_status_update', {
            messageId: message._id,
            status: 'delivered'
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

    socket.on('message_seen', async ({ otherUserId }) => {
      try {
        if (!otherUserId) return;

        const updatedMessages = await Message.find({
          sender: otherUserId,
          receiver: userId,
          status: { $ne: 'seen' }
        });

        if (updatedMessages.length === 0) {
          return;
        }

        const now = new Date();
        await Message.updateMany(
          {
            sender: otherUserId,
            receiver: userId,
            status: { $ne: 'seen' }
          },
          {
            $set: {
              status: 'seen',
              isRead: true,
              seenAt: now
            }
          }
        );

        io.to(socketRoomForUser(otherUserId)).emit('message_seen', {
          fromUserId: userId,
          toUserId: otherUserId,
          seenAt: now,
          messageIds: updatedMessages.map((message) => message._id.toString())
        });

        io.to(socketRoomForUser(otherUserId)).emit('message_status_update', {
          fromUserId: userId,
          toUserId: otherUserId,
          status: 'seen',
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
