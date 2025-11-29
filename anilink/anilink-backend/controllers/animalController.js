import { Animal } from '../models/Animal.js';
import { Herd } from '../models/Herd.js';

const ensureHerdOwnership = async (herdId, user) => {
  const herd = await Herd.findById(herdId);
  if (!herd) {
    const err = new Error('Herd not found');
    err.statusCode = 404;
    throw err;
  }
  if (user.role !== 'admin' && herd.farmer.toString() !== user._id.toString()) {
    const err = new Error('Not authorized to modify this herd');
    err.statusCode = 403;
    throw err;
  }
  return herd;
};

export const createAnimal = async (req, res) => {
  try {
    await ensureHerdOwnership(req.body.herd, req.user);
    const animal = await Animal.create({
      ...req.body,
      farmer: req.user._id
    });
    return res.status(201).json({
      status: 'success',
      data: { animal }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listAnimals = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin' && req.query.farmer
        ? { farmer: req.query.farmer }
        : { farmer: req.user._id };
    if (req.query.herd) filter.herd = req.query.herd;
    const animals = await Animal.find(filter)
      .populate('herd', 'name species')
      .sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: { animals }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getAnimal = async (req, res) => {
  try {
    const animal = await Animal.findById(req.params.id).populate(
      'herd',
      'name species'
    );
    if (!animal) {
      return res.status(404).json({
        status: 'error',
        message: 'Animal not found'
      });
    }
    if (
      req.user.role !== 'admin' &&
      animal.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { animal }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateAnimal = async (req, res) => {
  try {
    if (req.body.herd) {
      await ensureHerdOwnership(req.body.herd, req.user);
    }
    const animal = await Animal.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      req.body,
      { new: true }
    );
    if (!animal) {
      return res.status(404).json({
        status: 'error',
        message: 'Animal not found or not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { animal }
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteAnimal = async (req, res) => {
  try {
    const animal = await Animal.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id
    });
    if (!animal) {
      return res.status(404).json({
        status: 'error',
        message: 'Animal not found or not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Animal deleted'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

