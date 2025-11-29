import { Herd } from '../models/Herd.js';

export const createHerd = async (req, res) => {
  try {
    const herd = await Herd.create({
      ...req.body,
      farmer: req.user._id,
      createdBy: req.user._id
    });
    return res.status(201).json({
      status: 'success',
      data: { herd }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listHerds = async (req, res) => {
  try {
    const filter =
      req.user.role === 'admin' && req.query.farmer
        ? { farmer: req.query.farmer }
        : { farmer: req.user._id };
    const herds = await Herd.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      status: 'success',
      data: { herds }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getHerd = async (req, res) => {
  try {
    const herd = await Herd.findById(req.params.id);
    if (!herd) {
      return res.status(404).json({
        status: 'error',
        message: 'Herd not found'
      });
    }
    if (
      req.user.role !== 'admin' &&
      herd.farmer.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { herd }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const updateHerd = async (req, res) => {
  try {
    const herd = await Herd.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user._id },
      req.body,
      { new: true }
    );
    if (!herd) {
      return res.status(404).json({
        status: 'error',
        message: 'Herd not found or not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { herd }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const deleteHerd = async (req, res) => {
  try {
    const herd = await Herd.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user._id
    });
    if (!herd) {
      return res.status(404).json({
        status: 'error',
        message: 'Herd not found or not authorized'
      });
    }
    return res.status(200).json({
      status: 'success',
      message: 'Herd deleted'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

