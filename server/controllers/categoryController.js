const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return next(new AppError('Category with this name already exists', 400));
    }

    const category = await Category.create({ name });

    res.status(201).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    category.name = name;
    category.slug = undefined; // Forces revalidation and automatic slug update
    await category.save();

    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // Check if there are any products attached to this category
    const productsCount = await Product.countDocuments({ category: categoryId });
    if (productsCount > 0) {
      return next(
        new AppError(
          `Cannot delete category. There are ${productsCount} products assigned to it.`,
          400
        )
      );
    }

    await Category.findByIdAndDelete(categoryId);

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
