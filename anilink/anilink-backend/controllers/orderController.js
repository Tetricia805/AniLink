import crypto from 'crypto';
import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { InventoryLog } from '../models/InventoryLog.js';
import { PaymentIntent } from '../models/PaymentIntent.js';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  USER_ROLES,
  FULFILLMENT_STATUS
} from '../constants/enums.js';
import { pushOrderEvent } from '../services/pushService.js';

const buildTimelineEntry = (status, actor, comment) => ({
  status,
  actor,
  comment,
  at: new Date()
});

const generatePaymentReference = () =>
  `ORD-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`.toUpperCase();

const reserveStock = async (session, productId, vendorId, quantity) => {
  const product = await Product.findOneAndUpdate(
    { _id: productId, vendor: vendorId, stockQuantity: { $gte: quantity } },
    { $inc: { stockQuantity: -quantity } },
    { new: true, session }
  );
  if (!product) {
    const err = new Error('Insufficient stock for product');
    err.statusCode = 400;
    throw err;
  }
  await InventoryLog.create(
    [
      {
        product: productId,
        vendor: vendorId,
        change: -quantity,
        reason: 'order',
        notes: 'Stock reserved for order'
      }
    ],
    { session }
  );
  return product;
};

export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { vendorId, items, shipping, notes } = req.body;
    if (!items?.length) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one item is required'
      });
    }

    let subtotal = 0;
    const orderItems = [];
    for (const item of items) {
      const product = await reserveStock(
        session,
        item.productId,
        vendorId,
        item.quantity
      );
      const unitPrice = product.pricing?.unitPrice || 0;
      subtotal += unitPrice * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        unitPrice,
        currency: product.pricing?.currency || 'UGX'
      });
    }

    const shippingFee = shipping?.method === 'courier' ? 10000 : 0;
    const total = subtotal + shippingFee;

    const order = await Order.create(
      [
        {
          farmer: req.user._id,
          vendor: vendorId,
          items: orderItems,
          subtotal,
          shippingFee,
          total,
          currency: 'UGX',
          shippingMethod: shipping?.method || 'pickup',
          shippingAddress: shipping?.address,
          notes,
          timeline: [buildTimelineEntry(ORDER_STATUS.PENDING, req.user._id)]
        }
      ],
      { session }
    );

    const createdOrder = order[0];

    await PaymentIntent.create(
      [
        {
          farmer: req.user._id,
          vendor: vendorId,
          order: createdOrder._id,
          amount: total,
          currency: 'UGX',
          channel: shipping?.paymentChannel || 'flutterwave',
          status: PAYMENT_STATUS.PENDING,
          reference: generatePaymentReference(),
          purpose: 'order'
        }
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    pushOrderEvent(createdOrder, 'order:new');

    return res.status(201).json({
      status: 'success',
      data: { order: createdOrder }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listOrders = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === USER_ROLES.FARMER) {
      filter.farmer = req.user._id;
    } else if (req.user.role === USER_ROLES.VENDOR) {
      filter.vendor = req.user._id;
    } else if (req.user.role === USER_ROLES.ADMIN && req.query.vendor) {
      filter.vendor = req.query.vendor;
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('farmer', 'name phone')
      .populate('vendor', 'name phone')
      .populate('items.product', 'name pricing')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmer', 'name phone')
      .populate('vendor', 'name phone')
      .populate('items.product', 'name pricing');
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    if (
      req.user.role === USER_ROLES.FARMER &&
      order.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    if (
      req.user.role === USER_ROLES.VENDOR &&
      order.vendor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, comment, fulfillmentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    if (
      req.user.role === USER_ROLES.VENDOR &&
      order.vendor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }

    if (status) order.status = status;
    if (fulfillmentStatus)
      order.fulfillmentStatus = fulfillmentStatus;
    order.timeline.push(buildTimelineEntry(status || order.status, req.user._id, comment));

    await order.save();
    pushOrderEvent(order, 'order:status');
    return res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const markOrderPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.status = ORDER_STATUS.CONFIRMED;
    order.timeline.push(
      buildTimelineEntry('payment_received', req.user._id, req.body.comment)
    );
    await order.save();

    await PaymentIntent.findOneAndUpdate(
      { order: order._id },
      { status: PAYMENT_STATUS.PAID }
    );

    pushOrderEvent(order, 'order:paid');

    return res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

