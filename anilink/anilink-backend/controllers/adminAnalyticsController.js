import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Order } from '../models/Order.js';
import { HealthRecord } from '../models/HealthRecord.js';
import { AIInteraction } from '../models/AIInteraction.js';
import { Notification } from '../models/Notification.js';
import { toCSV } from '../utils/csvExporter.js';

export const getOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalVets,
      totalVendors,
      appointmentStats,
      orderStats,
      recentAI,
      unreadNotifications
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'vet' }),
      User.countDocuments({ role: 'vendor' }),
      Appointment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalVolume: { $sum: '$total' }
          }
        }
      ]),
      AIInteraction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('type confidence createdAt'),
      Notification.countDocuments({ readAt: { $exists: false } })
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          vets: totalVets,
          vendors: totalVendors
        },
        appointments: appointmentStats,
        orders: orderStats,
        recentAI,
        unreadNotifications
      }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getRecentActivities = async (req, res) => {
  try {
    const [appointments, orders, healthRecords] = await Promise.all([
      Appointment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('farmer vet status scheduledFor createdAt')
        .populate('farmer', 'name')
        .populate({
          path: 'vet',
          populate: { path: 'user', select: 'name' }
        }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('farmer vendor status total createdAt')
        .populate('farmer', 'name')
        .populate('vendor', 'name'),
      HealthRecord.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('recordType species createdAt farmer')
        .populate('farmer', 'name')
    ]);

    return res.status(200).json({
      status: 'success',
      data: { appointments, orders, healthRecords }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const exportOrdersCSV = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const orders = await Order.find(filter)
      .select('createdAt total currency status paymentStatus shippingMethod')
      .populate('farmer', 'name')
      .populate('vendor', 'name');

    const rows = orders.map((order) => ({
      createdAt: order.createdAt.toISOString(),
      farmer: order.farmer?.name,
      vendor: order.vendor?.name,
      total: order.total,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingMethod: order.shippingMethod
    }));

    const csv = toCSV(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('orders.csv');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

export const exportAppointmentsCSV = async (req, res) => {
  try {
    const filter = {};
    if (req.query.from || req.query.to) {
      filter.createdAt = {};
      if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
      if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
    }
    const appointments = await Appointment.find(filter)
      .select('scheduledFor status mode paymentStatus createdAt')
      .populate('farmer', 'name')
      .populate({
        path: 'vet',
        populate: { path: 'user', select: 'name' }
      });

    const rows = appointments.map((appt) => ({
      createdAt: appt.createdAt.toISOString(),
      scheduledFor: appt.scheduledFor.toISOString(),
      farmer: appt.farmer?.name,
      vet: appt.vet?.user?.name,
      status: appt.status,
      mode: appt.mode,
      paymentStatus: appt.paymentStatus
    }));

    const csv = toCSV(rows);
    res.header('Content-Type', 'text/csv');
    res.attachment('appointments.csv');
    return res.send(csv);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

