const express = require('express');
const { body, param } = require('express-validator');
const productController = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');
const validateRequest = require('../middleware/validate');

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid product ID format'),
    validateRequest
  ],
  productController.getProductById
);

router.post(
  '/bulk-import',
  protect,
  restrictTo('admin'),
  productController.bulkImport
);

router.post(
  '/',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('description').notEmpty().withMessage('Product description is required'),
    body('brand').trim().notEmpty().withMessage('Product brand is required'),
    body('category').isMongoId().withMessage('Product category must be a valid Category ID'),
    body('price').isFloat({ min: 0 }).withMessage('Product price must be a positive number'),
    body('affiliateLink').isURL().withMessage('Amazon affiliate link must be a valid URL'),
    validateRequest
  ],
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  restrictTo('admin'),
  upload.array('images', 5),
  [
    param('id').isMongoId().withMessage('Invalid product ID format'),
    body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
    body('description').optional().notEmpty().withMessage('Product description cannot be empty'),
    body('brand').optional().trim().notEmpty().withMessage('Product brand cannot be empty'),
    body('category').optional().isMongoId().withMessage('Product category must be a valid Category ID'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Product price must be a positive number'),
    body('affiliateLink').optional().isURL().withMessage('Amazon affiliate link must be a valid URL'),
    validateRequest
  ],
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  restrictTo('admin'),
  [
    param('id').isMongoId().withMessage('Invalid product ID format'),
    validateRequest
  ],
  productController.deleteProduct
);

module.exports = router;
