import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Notification } from '../models/Notification.js';
import { Conversation } from '../models/Conversation.js';
import { Message } from '../models/Message.js';

let io;
const userSockets = new Map();

const getTokenFromSocket = (socket) =>
  socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

const removeSocket = (userId, socketId) => {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  sockets.delete(socketId);
  if (!sockets.size) {
    userSockets.delete(userId);
  }
};

export const initSocketServer = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);
      if (!token) {
        return next(new Error('Unauthorized'));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub || decoded.id;
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', async (socket) => {
    const userId = String(socket.userId);
    const sockets = userSockets.get(userId) || new Set();
    sockets.add(socket.id);
    userSockets.set(userId, sockets);

    await sendUnreadCounts(userId);

    socket.on('disconnect', () => {
      removeSocket(userId, socket.id);
    });
  });
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  const sockets = userSockets.get(String(userId));
  if (!sockets) return;
  sockets.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

export const emitToUsers = (userIds = [], event, payload) => {
  userIds.forEach((userId) => emitToUser(userId, event, payload));
};

export const sendUnreadCounts = async (userId) => {
  try {
    const [notifications, conversationIds] = await Promise.all([
      Notification.countDocuments({ recipient: userId, readAt: { $exists: false } }),
      Conversation.find({ participants: userId }).distinct('_id')
    ]);

    const unreadMessages = await Message.countDocuments({
      conversation: { $in: conversationIds },
      readBy: { $ne: userId },
      sender: { $ne: userId }
    });

    emitToUser(userId, 'dashboard:unread', {
      notifications,
      messages: unreadMessages
    });
  } catch (error) {
    // fail silently
  }
};

