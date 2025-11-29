import crypto from 'crypto';
import { Appointment } from '../models/Appointment.js';
import { VetProfile } from '../models/VetProfile.js';
import { PaymentIntent } from '../models/PaymentIntent.js';
import {
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  USER_ROLES
} from '../constants/enums.js';
import { getVetProfileForUser } from '../utils/vetHelper.js';
import { pushAppointmentEvent } from '../services/pushService.js';

const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.REQUESTED,
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED
];

const buildTimelineEntry = (status, actor, comment) => ({
  status,
  actor,
  comment,
  at: new Date()
});

const generatePaymentReference = () =>
  `ANI-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`.toUpperCase();

const ensureVetProfile = async (vetId) => {
  const profile = await VetProfile.findById(vetId);
  if (!profile) {
    const error = new Error('Vet profile not found');
    error.statusCode = 404;
    throw error;
  }
  return profile;
};

const ensureAccess = (appointment, user, vetProfileId) => {
  if (user.role === USER_ROLES.ADMIN) return true;
  if (appointment.farmer.toString() === user._id.toString()) return true;
  if (vetProfileId && appointment.vet.toString() === vetProfileId.toString())
    return true;
  const err = new Error('Not authorized to access this appointment');
  err.statusCode = 403;
  throw err;
};

export const createAppointment = async (req, res) => {
  try {
    const {
      vetId,
      scheduledFor,
      durationMinutes = 60,
      mode,
      serviceId,
      serviceName,
      serviceFee,
      location,
      livestock,
      farmerNotes
    } = req.body;

    const vetProfile = await ensureVetProfile(vetId);
    const startDate = new Date(scheduledFor);
    if (Number.isNaN(startDate.getTime()) || startDate < new Date()) {
      return res.status(400).json({
        status: 'error',
        message: 'Scheduled time must be in the future'
      });
    }

    const service =
      vetProfile.services.find(
        (svc) => svc.code === serviceId || svc.name === serviceName
      ) ||
      {
        id: serviceId,
        name: serviceName || 'Consultation',
        baseFee: serviceFee,
        currency: 'UGX'
      };

    if (!service.name) {
      return res.status(400).json({
        status: 'error',
        message: 'Service name is required'
      });
    }

    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const overlap = await Appointment.findOne({
      vet: vetId,
      status: { $in: ACTIVE_STATUSES },
      $or: [
        {
          scheduledFor: { $lt: endDate },
          scheduledUntil: { $gt: startDate }
        }
      ]
    });

    if (overlap) {
      return res.status(409).json({
        status: 'error',
        message: 'Selected slot is no longer available'
      });
    }

    const requiresPayment = Boolean(baseFee && baseFee > 0);
    const baseFee = service.baseFee ?? serviceFee ?? 0;

    const appointment = await Appointment.create({
      farmer: req.user._id,
      vet: vetProfile._id,
      service: {
        id: serviceId || service.code,
        name: service.name,
        description: service.description,
        fee: baseFee,
        currency: service.currency || 'UGX'
      },
      scheduledFor: startDate,
      durationMinutes,
      scheduledUntil: endDate,
      mode,
      location,
      livestock,
      farmerNotes,
      paymentStatus: requiresPayment
        ? PAYMENT_STATUS.PENDING
        : PAYMENT_STATUS.NOT_REQUIRED,
      status: requiresPayment
        ? APPOINTMENT_STATUS.PENDING
        : APPOINTMENT_STATUS.CONFIRMED,
      timeline: [
        buildTimelineEntry(APPOINTMENT_STATUS.REQUESTED, req.user._id),
        buildTimelineEntry(
          requiresPayment
            ? APPOINTMENT_STATUS.PENDING
            : APPOINTMENT_STATUS.CONFIRMED,
          req.user._id
        )
      ]
    });

    if (requiresPayment) {
      await PaymentIntent.create({
        appointment: appointment._id,
        farmer: req.user._id,
        vet: vetProfile._id,
        amount: baseFee,
        currency: service.currency || 'UGX',
        status: PAYMENT_STATUS.PENDING,
        reference: generatePaymentReference(),
        channel: 'flutterwave'
      });
    }

    pushAppointmentEvent(appointment, 'appointment:new');

    return res.status(201).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (req.user.role === USER_ROLES.FARMER) {
      filter.farmer = req.user._id;
    } else if (req.user.role === USER_ROLES.VET) {
      const vetProfile = await getVetProfileForUser(req.user._id);
      if (!vetProfile) {
        return res.status(403).json({
          status: 'error',
          message: 'Vet profile not found'
        });
      }
      filter.vet = vetProfile._id;
    } else if (req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to view appointments'
      });
    }

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
      .populate('farmer', 'name phone email')
      .populate({
        path: 'vet',
        populate: { path: 'user', select: 'name phone email' }
      })
      .sort({ scheduledFor: 1 });

    return res.status(200).json({
      status: 'success',
      data: { appointments }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('farmer', 'name phone email')
      .populate({
        path: 'vet',
        populate: { path: 'user', select: 'name phone email' }
      });
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    const vetProfile = await getVetProfileForUser(req.user._id);
    ensureAccess(appointment, req.user, vetProfile?._id);

    return res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }

    const vetProfile = await getVetProfileForUser(req.user._id);
    ensureAccess(appointment, req.user, vetProfile?._id);

    const allowedStatuses = Object.values(APPOINTMENT_STATUS);
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status transition'
      });
    }

    if (
      req.user.role === USER_ROLES.FARMER &&
      status !== APPOINTMENT_STATUS.CANCELLED
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Farmers can only cancel appointments'
      });
    }

    appointment.status = status;
    if (status === APPOINTMENT_STATUS.CANCELLED) {
      appointment.cancellation = {
        reason: comment,
        cancelledAt: new Date(),
        cancelledBy: req.user._id
      };
    }

    appointment.timeline.push(buildTimelineEntry(status, req.user._id, comment));
    await appointment.save();
    pushAppointmentEvent(appointment);

    return res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const addVetNotes = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
    }
    const vetProfile = await getVetProfileForUser(req.user._id);
    ensureAccess(appointment, req.user, vetProfile?._id);

    appointment.vetNotes = req.body;
    if (appointment.status === APPOINTMENT_STATUS.CONFIRMED) {
      appointment.status = APPOINTMENT_STATUS.COMPLETED;
      appointment.timeline.push(
        buildTimelineEntry(APPOINTMENT_STATUS.COMPLETED, req.user._id)
      );
    }

    await appointment.save();
    pushAppointmentEvent(appointment, 'appointment:completed');
    return res.status(200).json({
      status: 'success',
      data: { appointment }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

