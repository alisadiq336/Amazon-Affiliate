const Product = require('../models/Product');
const Category = require('../models/Category');
const AppError = require('../utils/AppError');
const { uploadImage, deleteImage } = require('../services/cloudinaryService');

exports.getAllProducts = async (req, res, next) => {
  try {
    let query = {};

    // 1. Keyword search (Name, Brand, Description)
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { brand: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // 2. Price filtering
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
    }

    // 3. Category filtering (ID or Slug)
    if (req.query.category) {
      let categoryObj;
      if (req.query.category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryObj = await Category.findById(req.query.category);
      } else {
        categoryObj = await Category.findOne({ slug: req.query.category });
      }

      if (categoryObj) {
        query.category = categoryObj._id;
      } else {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: { products: [] }
        });
      }
    }

    // 4. Brand filtering
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Base query
    let dbQuery = Product.find(query).populate('category');

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      dbQuery = dbQuery.sort(sortBy);
    } else {
      dbQuery = dbQuery.sort('-createdAt');
    }

    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    dbQuery = dbQuery.skip(skip).limit(limit);

    const products = await dbQuery;
    const total = await Product.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: products.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: {
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return next(new AppError('Product not found', 404));
    }
    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { 
      name, description, brand, category, price, affiliateLink,
      rating, reviewsCount, discountPercent, isBestSeller, isTrending, isEditorsPick, longDescription 
    } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return next(new AppError('Selected category does not exist', 400));
    }

    // Parse specifications (JSON stringified from client)
    let parsedSpecs = {};
    if (req.body.specifications) {
      try {
        parsedSpecs = JSON.parse(req.body.specifications);
      } catch (err) {
        return next(new AppError('Invalid specifications JSON format', 400));
      }
    }

    // Handle files upload
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path);
        images.push(uploadResult);
      }
    } else {
      // Add default product image if none uploaded
      images.push({
        url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
        publicId: 'default_product'
      });
    }

    const product = await Product.create({
      name,
      description,
      brand,
      category,
      price: Number(price),
      images,
      specifications: parsedSpecs,
      affiliateLink,
      rating: rating ? Number(rating) : undefined,
      reviewsCount: reviewsCount ? Number(reviewsCount) : undefined,
      discountPercent: discountPercent ? Number(discountPercent) : undefined,
      isBestSeller: isBestSeller === 'true' || isBestSeller === true,
      isTrending: isTrending === 'true' || isTrending === true,
      isEditorsPick: isEditorsPick === 'true' || isEditorsPick === true,
      longDescription
    });

    res.status(201).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    const { 
      name, description, brand, category, price, affiliateLink,
      rating, reviewsCount, discountPercent, isBestSeller, isTrending, isEditorsPick, longDescription 
    } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(new AppError('Selected category does not exist', 400));
      }
      product.category = category;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (brand) product.brand = brand;
    if (price) product.price = Number(price);
    if (affiliateLink) product.affiliateLink = affiliateLink;
    if (rating !== undefined) product.rating = Number(rating);
    if (reviewsCount !== undefined) product.reviewsCount = Number(reviewsCount);
    if (discountPercent !== undefined) product.discountPercent = Number(discountPercent);
    if (isBestSeller !== undefined) product.isBestSeller = isBestSeller === 'true' || isBestSeller === true;
    if (isTrending !== undefined) product.isTrending = isTrending === 'true' || isTrending === true;
    if (isEditorsPick !== undefined) product.isEditorsPick = isEditorsPick === 'true' || isEditorsPick === true;
    if (longDescription !== undefined) product.longDescription = longDescription;

    if (req.body.specifications) {
      try {
        product.specifications = JSON.parse(req.body.specifications);
      } catch (err) {
        return next(new AppError('Invalid specifications JSON format', 400));
      }
    }

    // Upload new files if provided
    if (req.files && req.files.length > 0) {
      // If we upload new images, we can delete the old ones
      // Or keep them. Let's delete old ones to save space
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          if (img.publicId !== 'default_product') {
            await deleteImage(img.publicId);
          }
        }
      }

      const images = [];
      for (const file of req.files) {
        const uploadResult = await uploadImage(file.path);
        images.push(uploadResult);
      }
      product.images = images;
    }

    await product.save();

    res.status(200).json({
      status: 'success',
      data: {
        product
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Clean up images
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId !== 'default_product') {
          await deleteImage(img.publicId);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.bulkImport = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products)) {
      return next(new AppError('Products array is required in request body', 400));
    }

    // Cache categories to speed up lookup/insertion
    const categoryCache = new Map();
    const currentCategories = await Category.find({});
    currentCategories.forEach(c => {
      categoryCache.set(c.name.toLowerCase().trim(), c._id);
    });

    // Cache existing product names to skip duplicates efficiently
    const existingProducts = await Product.find({}, 'name');
    const existingNames = new Set(existingProducts.map(p => p.name.toLowerCase().trim()));

    const productsToInsert = [];
    const report = {
      successCount: 0,
      skipCount: 0,
      errorCount: 0,
      errors: []
    };

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const rowNum = i + 2; // Assuming header is row 1

      // Validate required columns
      if (!p.name || !p.description || !p.category || !p.brand || p.price === undefined || !p.affiliateLink) {
        report.errorCount++;
        report.errors.push(`Row ${rowNum}: Missing required product details.`);
        continue;
      }

      const cleanName = p.name.toString().trim();
      const cleanBrand = p.brand.toString().trim();
      const cleanCategoryName = p.category.toString().trim();

      // Check duplicates (skip duplicates requirement)
      if (existingNames.has(cleanName.toLowerCase())) {
        report.skipCount++;
        continue;
      }

      // Check and retrieve category from cache, or create it
      let categoryId = categoryCache.get(cleanCategoryName.toLowerCase());
      if (!categoryId) {
        try {
          const newCat = await Category.create({ name: cleanCategoryName });
          categoryId = newCat._id;
          categoryCache.set(cleanCategoryName.toLowerCase(), categoryId);
        } catch (catErr) {
          report.errorCount++;
          report.errors.push(`Row ${rowNum}: Category creation error "${cleanCategoryName}".`);
          continue;
        }
      }

      // Build product object
      const images = [];
      if (p.imageUrl) {
        images.push({
          url: p.imageUrl.toString().trim(),
          publicId: 'bulk_imported'
        });
      } else {
        images.push({
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
          publicId: 'default_product'
        });
      }

      const ratingNum = p.rating ? Number(p.rating) : 4.5;
      const reviewsCountNum = p.reviewsCount ? Number(p.reviewsCount) : 24;
      const discountPercentNum = p.discountPercent ? Number(p.discountPercent) : 0;

      // Extract specifications if provided as key-value pairs
      let specificationsMap = {};
      if (p.specifications) {
        if (typeof p.specifications === 'object') {
          specificationsMap = p.specifications;
        } else if (typeof p.specifications === 'string') {
          try {
            specificationsMap = JSON.parse(p.specifications);
          } catch (jsonErr) {
            // Ignored, defaults to empty
          }
        }
      }

      productsToInsert.push({
        name: cleanName,
        brand: cleanBrand,
        category: categoryId,
        price: Number(p.price) || 0,
        description: p.description.toString().trim(),
        affiliateLink: p.affiliateLink.toString().trim(),
        images,
        rating: ratingNum,
        reviewsCount: reviewsCountNum,
        discountPercent: discountPercentNum,
        isEditorsPick: p.isEditorsPick === 'true' || p.isEditorsPick === true || p.isEditorsPick === '1' || p.isEditorsPick === 1,
        isBestSeller: p.isBestSeller === 'true' || p.isBestSeller === true || p.isBestSeller === '1' || p.isBestSeller === 1,
        isTrending: p.isTrending === 'true' || p.isTrending === true || p.isTrending === '1' || p.isTrending === 1,
        longDescription: p.longDescription ? p.longDescription.toString() : p.description.toString().trim(),
        specifications: specificationsMap
      });

      // Track duplicate state locally so multi-row inserts inside the same batch skip correctly
      existingNames.add(cleanName.toLowerCase());
    }

    // Efficient bulk insert inside MongoDB
    if (productsToInsert.length > 0) {
      try {
        await Product.insertMany(productsToInsert, { ordered: false });
        report.successCount = productsToInsert.length;
      } catch (insertErr) {
        if (insertErr.writeErrors) {
          report.successCount = productsToInsert.length - insertErr.writeErrors.length;
          report.errorCount += insertErr.writeErrors.length;
          insertErr.writeErrors.forEach(we => {
            report.errors.push(`Database error on index ${we.index}: ${we.errmsg}`);
          });
        } else {
          return next(new AppError('Database insertion failed during bulk operation', 500));
        }
      }
    }

    res.status(200).json({
      status: 'success',
      report
    });
  } catch (error) {
    next(error);
  }
};
