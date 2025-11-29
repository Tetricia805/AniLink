import { Notification } from '../models/Notification.js';
import { USER_ROLES } from '../constants/enums.js';
import { pushNotifications } from '../services/pushService.js';
import { sendUnreadCounts } from '../sockets/socketManager.js';

export const createNotification = async (req, res) => {
  try {
    if (![USER_ROLES.ADMIN].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Only admins can broadcast notifications'
      });
    }

    const payloads = req.body.recipients.map((recipient) => ({
      recipient,
      targetRole: req.body.targetRole,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      data: req.body.data,
      expiresAt: req.body.expiresAt,
      priority: req.body.priority,
      createdBy: req.user._id
    }));

    const notifications = await Notification.create(payloads);
    await pushNotifications(notifications);
    return res.status(201).json({
      status: 'success',
      data: { notifications }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const filter = { recipient: req.user._id };
    if (req.query.unread === 'true') {
      filter.readAt = { $exists: false };
    }
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(100);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      readAt: { $exists: false }
    });
    return res.status(200).json({
      status: 'success',
      data: { notifications, unreadCount }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { readAt: new Date() },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }
    await sendUnreadCounts(req.user._id.toString());
    return res.status(200).json({
      status: 'success',
      data: { notification }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, readAt: { $exists: false } },
      { readAt: new Date() }
    );
    await sendUnreadCounts(req.user._id.toString());
    return res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

