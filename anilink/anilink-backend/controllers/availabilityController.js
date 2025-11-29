import { VetAvailability } from '../models/VetAvailability.js';
import { Appointment } from '../models/Appointment.js';
import {
  USER_ROLES,
  AVAILABILITY_TYPES,
  APPOINTMENT_STATUS
} from '../constants/enums.js';
import { getVetProfileForUser } from '../utils/vetHelper.js';

const ACTIVE_STATUSES = [
  APPOINTMENT_STATUS.REQUESTED,
  APPOINTMENT_STATUS.PENDING,
  APPOINTMENT_STATUS.CONFIRMED
];

const combineDateTime = (dateString, timeString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const buildSlotsFromRange = (date, availability) => {
  const slots = [];
  const start = combineDateTime(date, availability.startTime);
  const end = combineDateTime(date, availability.endTime);
  if (!start || !end) return slots;
  let cursor = new Date(start);
  while (cursor < end) {
    const slotEnd = new Date(
      cursor.getTime() + availability.slotDurationMinutes * 60000
    );
    if (slotEnd > end) break;
    slots.push({
      start: new Date(cursor),
      end: slotEnd
    });
    cursor = slotEnd;
  }
  return slots;
};

export const createAvailability = async (req, res) => {
  try {
    const vetProfile = await getVetProfileForUser(req.user._id);
    if (!vetProfile) {
      return res.status(403).json({
        status: 'error',
        message: 'Vet profile not found'
      });
    }
    const payload = {
      ...req.body,
      vet: vetProfile._id
    };
    const availability = await VetAvailability.create(payload);
    return res.status(201).json({
      status: 'success',
      data: { availability }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listAvailability = async (req, res) => {
  try {
    const { vetId, from, to } = req.query;
    const filter = {};
    if (vetId) filter.vet = vetId;

    if (from || to) {
      filter.$or = [
        {
          type: AVAILABILITY_TYPES.RECURRING
        },
        {
          date: {}
        }
      ];
      if (from) filter.$or[1].date.$gte = new Date(from);
      if (to) filter.$or[1].date.$lte = new Date(to);
    }

    const availability = await VetAvailability.find(filter).sort({
      createdAt: -1
    });
    return res.status(200).json({
      status: 'success',
      data: { availability }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteAvailability = async (req, res) => {
  try {
    const vetProfile = await getVetProfileForUser(req.user._id);
    if (!vetProfile && req.user.role !== USER_ROLES.ADMIN) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    const availability = await VetAvailability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({
        status: 'error',
        message: 'Availability not found'
      });
    }
    if (
      req.user.role !== USER_ROLES.ADMIN &&
      availability.vet.toString() !== vetProfile._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    await availability.deleteOne();
    return res.status(200).json({
      status: 'success',
      message: 'Availability deleted'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getOpenSlots = async (req, res) => {
  try {
    const { vetId, date } = req.query;
    if (!vetId || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'vetId and date are required'
      });
    }

    const targetDate = new Date(date);
    if (Number.isNaN(targetDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid date parameter'
      });
    }

    const dayName = targetDate
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();

    const availabilityDocs = await VetAvailability.find({
      vet: vetId,
      $or: [
        { type: AVAILABILITY_TYPES.RECURRING, dayOfWeek: dayName },
        {
          type: { $in: [AVAILABILITY_TYPES.ONE_TIME, AVAILABILITY_TYPES.BLOCKED] },
          date: targetDate
        }
      ],
      isActive: true
    });

    const blockedRanges = availabilityDocs.filter(
      (slot) => slot.type === AVAILABILITY_TYPES.BLOCKED
    );
    const positiveSlots = availabilityDocs.filter(
      (slot) => slot.type !== AVAILABILITY_TYPES.BLOCKED
    );

    let slots = [];
    positiveSlots.forEach((slot) => {
      slots = slots.concat(buildSlotsFromRange(targetDate, slot.toObject()));
    });

    // Remove blocked ranges
    const filteredSlots = slots.filter((slot) => {
      return !blockedRanges.some((blocked) => {
        const blockedStart = combineDateTime(date, blocked.startTime);
        const blockedEnd = combineDateTime(date, blocked.endTime);
        return (
          blockedStart &&
          blockedEnd &&
          slot.start < blockedEnd &&
          slot.end > blockedStart
        );
      });
    });

    // Remove already-booked appointments
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await Appointment.find({
      vet: vetId,
      status: { $in: ACTIVE_STATUSES },
      scheduledFor: { $gte: dayStart, $lte: dayEnd }
    });

    const openSlots = filteredSlots.filter((slot) => {
      return !existingAppointments.some(
        (appt) =>
          slot.start < appt.scheduledUntil && slot.end > appt.scheduledFor
      );
    });

    return res.status(200).json({
      status: 'success',
      data: {
        date: targetDate,
        slots: openSlots
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

