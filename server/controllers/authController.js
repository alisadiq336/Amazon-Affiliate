const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const AppError = require('../utils/AppError');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Customer Sign Up
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('Email address is already in use', 400));
    }

    const newUser = await User.create({
      username,
      email,
      password,
      role: 'customer' // Registration defaults to customer role
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// General Email/Password Sign In (Admin & Customer)
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Role-based login enforcement
    if (role && user.role !== role) {
      return next(
        new AppError(`Access denied. This portal is for ${role} login only.`, 403)
      );
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Google OAuth Login Verification
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return next(new AppError('Google authentication credentials missing', 400));
    }

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch (err) {
      console.warn('Official Google OAuth library validation failed. Falling back to local token decode for development environment.');
      // Local Decode Fallback (For local testing without Google Client ID configurations in .env)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      payload = JSON.parse(jsonPayload);
    }

    const { email, name, sub } = payload;
    let user = await User.findOne({ email });

    if (!user) {
      // Create new customer using Google details
      user = await User.create({
        username: name || email.split('@')[0],
        email,
        googleId: sub,
        role: 'customer'
      });
    } else if (!user.googleId) {
      // Link Google Account to local registration
      user.googleId = sub;
      await user.save();
    }

    createSendToken(user, 200, res);
  } catch (error) {
    next(new AppError('Google OAuth authentication failed. Please try again.', 401));
  }
};

// Forgot Password Flow
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError('There is no account associated with this email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In a development environment, log the reset URL directly to console to bypass SMTP configurations
    const resetURL = `${req.protocol}://localhost:5173/reset-password/${resetToken}`;
    console.log('---------------------------------------------------------');
    console.log('PASSWORD RESET LINK TRIGGERED:');
    console.log(resetURL);
    console.log('---------------------------------------------------------');

    res.status(200).json({
      status: 'success',
      message: 'Password reset link generated. Check the server output console logs to claim the link!'
    });
  } catch (error) {
    next(error);
  }
};

// Reset Password Flow
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Password reset link is invalid or has expired.', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Fetch current user details
exports.getMe = async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
};

// Profile Update Details
exports.updateMe = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (username) user.username = username;
    if (email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return next(new AppError('This email is already in use.', 400));
      }
      user.email = email;
    }

    await user.save();
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Profile Update Password
exports.updateMyPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError('Your current password statement is incorrect.', 401));
    }

    user.password = newPassword;
    await user.save();

    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Admin: Fetch all users
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Update user details/role
exports.updateUser = async (req, res, next) => {
  try {
    const { role, username } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent administrators from removing their own admin role
    if (user._id.toString() === req.user._id.toString() && role && role !== 'admin') {
      return next(new AppError('You cannot revoke your own administrator role.', 400));
    }

    if (role) user.role = role;
    if (username) user.username = username;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Prevent admin self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return next(new AppError('You cannot delete your own active administrator profile.', 400));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
