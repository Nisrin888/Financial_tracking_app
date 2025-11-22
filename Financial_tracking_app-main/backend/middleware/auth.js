/**
 * Authentication Middleware
 * Handles JWT verification, user authentication, and role-based access control
 */

const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
const User = require('../models/User.model');

// Middleware: Protect routes by verifying JWT
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Or extract token from cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If no token is found, deny access
    if (!token) {
      return next(new AppError('Not authorized to access this route', 401));
    }

    try {
      // Validate and decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user associated with the token
      req.user = await User.findById(decoded.id).select('-passwordHash');

      if (!req.user) {
        return next(new AppError('User not found', 404));
      }

      // Check if the user's account is active
      if (!req.user.isActive) {
        return next(new AppError('Account is deactivated', 403));
      }

      next();
    } catch (err) {
      // Token invalid or expired
      return next(new AppError('Not authorized to access this route', 401));
    }
  } catch (error) {
    next(error);
  }
};

// Middleware: Restrict access based on user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Middleware: Optional authentication
// Allows access without a token, but attaches user info if token exists and is valid
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Extract JWT from header or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    // If token exists, try to verify it
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-passwordHash');
      } catch (err) {
        // Invalid token → proceed without authenticating the user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
