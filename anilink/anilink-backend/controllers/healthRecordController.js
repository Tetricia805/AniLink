import { HealthRecord } from '../models/HealthRecord.js';
import { Animal } from '../models/Animal.js';
import { getVetProfileForUser } from '../utils/vetHelper.js';
import { USER_ROLES } from '../constants/enums.js';

const ensureRecordAccess = async (record, user, vetProfileId) => {
  if (!record) {
    const err = new Error('Record not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role === USER_ROLES.ADMIN) return;
  if (record.farmer.toString() === user._id.toString()) return;
  if (
    user.role === USER_ROLES.VET &&
    vetProfileId &&
    record.vet?.toString() === vetProfileId.toString()
  ) {
    return;
  }
  const err = new Error('Not authorized to access this record');
  err.statusCode = 403;
  throw err;
};

export const createHealthRecord = async (req, res) => {
  try {
    let vetProfile = null;
    if (req.user.role === USER_ROLES.VET) {
      vetProfile = await getVetProfileForUser(req.user._id);
    }

    if (req.body.animal) {
      const animal = await Animal.findById(req.body.animal);
      if (!animal) {
        return res.status(404).json({
          status: 'error',
          message: 'Animal not found'
        });
      }
      if (
        req.user.role !== USER_ROLES.ADMIN &&
        animal.farmer.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to add record to this animal'
        });
      }
    }

    const payload = {
      ...req.body,
      farmer:
        req.user.role === USER_ROLES.ADMIN && req.body.farmer
          ? req.body.farmer
          : req.user._id,
      vet: vetProfile?._id,
      createdBy: req.user._id
    };

    const record = await HealthRecord.create(payload);
    return res.status(201).json({
      status: 'success',
      data: { record }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listHealthRecords = async (req, res) => {
  try {
    const filter = {};
    if (req.query.animal) filter.animal = req.query.animal;
    if (req.query.herd) filter.herd = req.query.herd;
    if (req.query.recordType) filter.recordType = req.query.recordType;
    if (req.query.farmer && req.user.role === USER_ROLES.ADMIN) {
      filter.farmer = req.query.farmer;
    } else {
      filter.farmer = req.user._id;
    }

    const records = await HealthRecord.find(filter)
      .populate('animal', 'tagId species')
      .populate('herd', 'name species')
      .populate({
        path: 'vet',
        populate: { path: 'user', select: 'name phone email' }
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      data: { records }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id)
      .populate('animal', 'tagId species')
      .populate('herd', 'name species')
      .populate({
        path: 'vet',
        populate: { path: 'user', select: 'name phone email' }
      });
    const vetProfile = await getVetProfileForUser(req.user._id);
    await ensureRecordAccess(record, req.user, vetProfile?._id);

    return res.status(200).json({
      status: 'success',
      data: { record }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    const vetProfile = await getVetProfileForUser(req.user._id);
    await ensureRecordAccess(record, req.user, vetProfile?._id);

    Object.assign(record, req.body);
    await record.save();
    return res.status(200).json({
      status: 'success',
      data: { record }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const record = await HealthRecord.findById(req.params.id);
    const vetProfile = await getVetProfileForUser(req.user._id);
    await ensureRecordAccess(record, req.user, vetProfile?._id);

    await record.deleteOne();
    return res.status(200).json({
      status: 'success',
      message: 'Record deleted'
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

