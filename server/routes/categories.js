const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/auth');
const validateRequest = require('../middleware/validate');

const router = express.Router();

router.get('/', categoryController.getAllCategories);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2 })
      .withMessage('Category name must be at least 2 characters'),
    validateRequest
  ],
  categoryController.createCategory
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  [
    param('id').isMongoId().withMessage('Invalid category ID format'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2 })
      .withMessage('Category name must be at least 2 characters'),
    validateRequest
  ],
  categoryController.updateCategory
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  [
    param('id').isMongoId().withMessage('Invalid category ID format'),
    validateRequest
  ],
  categoryController.deleteCategory
);

module.exports = router;
