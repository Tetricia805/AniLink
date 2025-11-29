import { User } from '../models/User.js';
import { USER_STATUSES } from '../constants/enums.js';

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'phone',
      'region',
      'district',
      'address',
      'preferredLanguages',
      'preferredContactMethod',
      'farmerProfile'
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (req.body.location?.coordinates) {
      updates.location = {
        type: 'Point',
        coordinates: [
          req.body.location.coordinates[0],
          req.body.location.coordinates[1]
        ]
      };
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true
    });

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    user.security.lastPasswordChangeAt = new Date();
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file?.path) {
      return res.status(400).json({
        status: 'error',
        message: 'No image uploaded'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: req.file.path },
      { new: true }
    );

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const adminUpdateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(USER_STATUSES).includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

