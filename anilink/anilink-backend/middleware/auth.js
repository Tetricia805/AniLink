import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { USER_STATUSES } from '../constants/enums.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.anilink_access) {
      token = req.cookies.anilink_access;
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub || decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    if (user.status === USER_STATUSES.SUSPENDED) {
      return res.status(403).json({
        status: 'error',
        message: 'Account suspended. Please contact support.'
      });
    }

    if (user.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: 'error',
        message: 'Please login again.'
      });
    }

    req.user = user;
    req.token = token;
    return next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      status: 'error',
      message: `User role '${req.user.role}' is not authorized to access this route`
    });
  }
  return next();
};
