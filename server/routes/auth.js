const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validateRequest
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  authController.login
);

router.post(
  '/google-login',
  [
    body('token').notEmpty().withMessage('Google credential token is required'),
    validateRequest
  ],
  authController.googleLogin
);

router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validateRequest
  ],
  authController.forgotPassword
);

router.post(
  '/reset-password/:token',
  [
    param('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    validateRequest
  ],
  authController.resetPassword
);

router.get('/me', protect, authController.getMe);

router.put(
  '/update-me',
  protect,
  [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters long'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    validateRequest
  ],
  authController.updateMe
);

router.put(
  '/update-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
    validateRequest
  ],
  authController.updateMyPassword
);

// Administrator User Management Routes
router.get('/users', protect, restrictTo('admin'), authController.getAllUsers);
router.put('/users/:id', protect, restrictTo('admin'), authController.updateUser);
router.delete('/users/:id', protect, restrictTo('admin'), authController.deleteUser);

module.exports = router;
