import { emitToUser, emitToUsers, sendUnreadCounts } from '../sockets/socketManager.js';

export const pushNotifications = async (notifications = []) => {
  notifications.forEach((notification) => {
    emitToUser(notification.recipient, 'notification:new', notification);
  });
  await Promise.all(
    notifications.map((notification) => sendUnreadCounts(notification.recipient.toString()))
  );
};

export const pushMessageEvent = async (conversation, message) => {
  const recipients = conversation.participants
    .map((id) => id.toString())
    .filter((id) => id !== message.sender.toString());
  emitToUsers(recipients, 'conversation:new-message', {
    conversationId: conversation._id,
    message
  });
  await Promise.all(recipients.map((id) => sendUnreadCounts(id)));
};

export const pushOrderEvent = (order, event = 'order:update') => {
  emitToUser(order.farmer, event, {
    orderId: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    updatedAt: order.updatedAt
  });
  emitToUser(order.vendor, event, {
    orderId: order._id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    updatedAt: order.updatedAt
  });
};

export const pushAppointmentEvent = (appointment, event = 'appointment:update') => {
  emitToUser(appointment.farmer, event, {
    appointmentId: appointment._id,
    status: appointment.status,
    scheduledFor: appointment.scheduledFor,
    updatedAt: appointment.updatedAt
  });
};

