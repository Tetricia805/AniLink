import { VetProfile } from '../models/VetProfile.js';
import { User } from '../models/User.js';
import { USER_ROLES, USER_STATUSES } from '../constants/enums.js';

const populateUserFields = {
  path: 'user',
  select: 'name phone email avatar role'
};

export const upsertVetProfile = async (req, res) => {
  try {
    const payload = {
      ...req.body,
      user: req.user._id,
      location: {
        type: 'Point',
        coordinates: [
          req.body.location.coordinates[0],
          req.body.location.coordinates[1]
        ]
      }
    };

    const profile = await VetProfile.findOneAndUpdate(
      { user: req.user._id },
      payload,
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    ).populate(populateUserFields);

    if (req.user.role !== USER_ROLES.VET) {
      req.user.role = USER_ROLES.VET;
      req.user.status = USER_STATUSES.PENDING;
      await req.user.save();
    } else if (req.user.status === USER_STATUSES.PENDING) {
      req.user.status = USER_STATUSES.PENDING;
      await req.user.save();
    }

    return res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMyVetProfile = async (req, res) => {
  try {
    const profile = await VetProfile.findOne({ user: req.user._id }).populate(
      populateUserFields
    );

    if (!profile) {
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: { profile }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const listVets = async (req, res) => {
  try {
    const {
      region,
      district,
      species,
      mode,
      emergency,
      minRating,
      includePending
    } = req.query;

    // By default, only show active vets. In development, allow including pending vets
    const statusFilter = includePending === 'true' || process.env.NODE_ENV === 'development'
      ? { $in: [USER_STATUSES.ACTIVE, USER_STATUSES.PENDING] }
      : USER_STATUSES.ACTIVE;

    const filters = {
      status: statusFilter
    };

    const ratingFloor = Number(minRating ?? 0);
    if (!Number.isNaN(ratingFloor)) {
      filters.rating = { $gte: ratingFloor };
    }

    if (region) filters.region = region;
    if (district) filters.district = district;
    if (species) filters.speciesCoverage = species;
    if (mode) filters.consultationModes = mode;
    if (emergency !== undefined)
      filters.emergencySupport = emergency === 'true';

    const vets = await VetProfile.find(filters)
      .populate(populateUserFields)
      .sort({ rating: -1, status: 1 }); // Sort by rating, then by status (active first)

    return res.status(200).json({
      status: 'success',
      data: { vets }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getVetById = async (req, res) => {
  try {
    const vet = await VetProfile.findById(req.params.id).populate(
      populateUserFields
    );
    if (!vet) {
      return res.status(404).json({
        status: 'error',
        message: 'Vet not found'
      });
    }
    return res.status(200).json({
      status: 'success',
      data: { vet }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const nearbyVets = async (req, res) => {
  try {
    const { lat, lng, radius = 30 } = req.query;
    const vets = await VetProfile.find({
      status: USER_STATUSES.ACTIVE,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          },
          $maxDistance: Number(radius) * 1000
        }
      }
    }).populate(populateUserFields);

    return res.status(200).json({
      status: 'success',
      data: { vets }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const verifyVetProfile = async (req, res) => {
  try {
    const { status } = req.body;
    if (!Object.values(USER_STATUSES).includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid vet status'
      });
    }
    const vet = await VetProfile.findByIdAndUpdate(
      req.params.id,
      {
        status,
        verifiedAt: status === USER_STATUSES.ACTIVE ? new Date() : undefined
      },
      { new: true }
    ).populate(populateUserFields);

    if (!vet) {
      return res.status(404).json({
        status: 'error',
        message: 'Vet not found'
      });
    }

    await User.findByIdAndUpdate(vet.user._id, { status });

    return res.status(200).json({
      status: 'success',
      data: { vet }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

