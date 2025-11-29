import { User } from '../models/User.js';
import {
  issueAuthTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeUserTokens
} from '../utils/tokenManager.js';
import { attachAuthCookies, clearAuthCookies } from '../utils/cookieManager.js';
import { USER_ROLES, USER_STATUSES } from '../constants/enums.js';

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  region: user.region,
  district: user.district,
  status: user.status,
  verified: user.verified,
  avatar: user.avatar,
  farmerProfile: user.farmerProfile
});

const sendAuthPayload = async (res, user, meta = {}, statusCode = 200) => {
  const tokens = await issueAuthTokens(user, meta);
  attachAuthCookies(res, tokens);
  return res.status(statusCode).json({
    status: 'success',
    data: {
      user: formatUserResponse(user),
      tokens
    }
  });
};

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = USER_ROLES.FARMER,
      region,
      district,
      address,
      location,
      farmerProfile
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      region,
      district,
      address,
      location: location?.coordinates
        ? {
            type: 'Point',
            coordinates: [
              location.coordinates[0],
              location.coordinates[1]
            ]
          }
        : undefined,
      farmerProfile: role === USER_ROLES.FARMER ? farmerProfile : undefined,
      status: role === USER_ROLES.VET ? USER_STATUSES.PENDING : USER_STATUSES.ACTIVE,
      metadata: {
        device: req.headers['user-agent'],
        lastIp: req.ip
      }
    });

    return sendAuthPayload(
      res,
      user,
      {
        userAgent: req.headers['user-agent'],
        ip: req.ip
      },
      201
    );
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (user.status === USER_STATUSES.SUSPENDED) {
      return res.status(403).json({
        status: 'error',
        message: 'Account suspended. Please contact support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    user.security.lastLoginAt = new Date();
    await user.save();

    return sendAuthPayload(res, user, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    status: 'success',
    data: {
      user: formatUserResponse(req.user)
    }
  });
};

export const logout = async (req, res) => {
  try {
    const refreshToken =
      req.cookies?.anilink_refresh || req.body?.refreshToken;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken, 'logout');
    }
    clearAuthCookies(res);
    return res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const incomingToken =
      req.cookies?.anilink_refresh || req.body?.refreshToken;

    const session = await verifyRefreshToken(incomingToken);
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token'
      });
    }

    const user = await User.findById(session.user);
    if (!user || user.status !== USER_STATUSES.ACTIVE) {
      await revokeRefreshToken(incomingToken, 'invalid-user');
      return res.status(401).json({
        status: 'error',
        message: 'Invalid session'
      });
    }

    await revokeRefreshToken(incomingToken, 'rotated');

    return sendAuthPayload(res, user, {
      userAgent: req.headers['user-agent'],
      ip: req.ip
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

export const forceLogoutAll = async (req, res) => {
  try {
    await revokeUserTokens(req.user._id);
    clearAuthCookies(res);
    return res.status(200).json({
      status: 'success',
      message: 'All sessions cleared'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
