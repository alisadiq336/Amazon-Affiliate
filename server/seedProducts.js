const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const XLSX = require('xlsx');

// Load environment configurations
dotenv.config();

const Product = require('./models/Product');
const Category = require('./models/Category');

const printHelp = () => {
  console.log('\n--- Product Seeder Utility CLI ---');
  console.log('Usage:');
  console.log('  node seedProducts.js <filepath>');
  console.log('\nSupported extensions:');
  console.log('  .csv, .xlsx, .json');
  console.log('\nRequired Columns/Fields:');
  console.log('  - Product Name');
  console.log('  - Description');
  console.log('  - Category');
  console.log('  - Brand');
  console.log('  - Price');
  console.log('  - Affiliate Link');
  console.log('  - Image URL (Optional, fallback provided)\n');
  process.exit(1);
};

const runSeeder = async () => {
  const filePathArg = process.argv[2];
  if (!filePathArg) {
    printHelp();
  }

  const resolvedPath = path.resolve(filePathArg);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: File does not exist at path: ${resolvedPath}`);
    process.exit(1);
  }

  const ext = path.extname(resolvedPath).toLowerCase();
  let rawProducts = [];

  console.log(`\nReading file: ${path.basename(resolvedPath)}...`);

  try {
    if (ext === '.json') {
      const fileData = fs.readFileSync(resolvedPath, 'utf8');
      rawProducts = JSON.parse(fileData);
    } else if (ext === '.csv' || ext === '.xlsx') {
      const workbook = XLSX.readFile(resolvedPath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      // Convert sheet rows to JSON objects using headers
      rawProducts = XLSX.utils.sheet_to_json(sheet);
    } else {
      console.error(`Error: Unsupported file format "${ext}". Please use CSV, XLSX, or JSON.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error parsing input file:', err.message);
    process.exit(1);
  }

  if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
    console.error('Error: No products parsed from file. Ensure structure is valid.');
    process.exit(1);
  }

  console.log(`Parsed ${rawProducts.length} rows. Initiating MongoDB connection...`);

  // Connect to Database
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB database.');
  } catch (dbErr) {
    console.error('Database connection failed:', dbErr.message);
    process.exit(1);
  }

  // Seeding parameters
  const batchSize = 1000;
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errorsList = [];

  try {
    // Cache categories
    const categoryCache = new Map();
    const currentCats = await Category.find({});
    currentCats.forEach(c => categoryCache.set(c.name.toLowerCase().trim(), c._id));

    // Cache product names for duplicate skipping
    const allProducts = await Product.find({}, 'name');
    const existingNames = new Set(allProducts.map(p => p.name.toLowerCase().trim()));

    const productsToInsert = [];

    console.log('\nValidating products list...');

    for (let i = 0; i < rawProducts.length; i++) {
      const row = rawProducts[i];
      const rowNum = i + 2;

      // Extract columns (support both standard camelCase and space-spaced headers)
      const name = row['Product Name'] || row.name || row.Product_Name;
      const description = row['Description'] || row.description;
      const category = row['Category'] || row.category;
      const brand = row['Brand'] || row.brand;
      const price = row['Price'] || row.price;
      const affiliateLink = row['Affiliate Link'] || row.affiliateLink || row.Affiliate_Link;
      const imageUrl = row['Image URL'] || row.imageUrl || row.Image_URL;

      if (!name || !description || !category || !brand || price === undefined || !affiliateLink) {
        errorCount++;
        errorsList.push(`Row ${rowNum}: Missing required fields.`);
        continue;
      }

      const cleanName = name.toString().trim();
      const cleanBrand = brand.toString().trim();
      const cleanCategory = category.toString().trim();

      // Check duplicates
      if (existingNames.has(cleanName.toLowerCase())) {
        skipCount++;
        continue;
      }

      // Check category
      let categoryId = categoryCache.get(cleanCategory.toLowerCase());
      if (!categoryId) {
        try {
          const newCat = await Category.create({ name: cleanCategory });
          categoryId = newCat._id;
          categoryCache.set(cleanCategory.toLowerCase(), categoryId);
        } catch (catErr) {
          errorCount++;
          errorsList.push(`Row ${rowNum}: Category creation error for "${cleanCategory}".`);
          continue;
        }
      }

      const images = [{
        url: imageUrl ? imageUrl.toString().trim() : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
        publicId: 'bulk_seeded'
      }];

      // Format specs if present
      let specs = {};
      if (row.specifications) {
        if (typeof row.specifications === 'object') {
          specs = row.specifications;
        } else if (typeof row.specifications === 'string') {
          try {
            specs = JSON.parse(row.specifications);
          } catch (e) {
            // Ignored
          }
        }
      }

      productsToInsert.push({
        name: cleanName,
        brand: cleanBrand,
        category: categoryId,
        price: Number(price) || 0,
        description: description.toString().trim(),
        affiliateLink: affiliateLink.toString().trim(),
        images,
        rating: row.rating ? Number(row.rating) : 4.5,
        reviewsCount: row.reviewsCount ? Number(row.reviewsCount) : 24,
        discountPercent: row.discountPercent ? Number(row.discountPercent) : 0,
        isEditorsPick: row.isEditorsPick === 'true' || row.isEditorsPick === true || row.isEditorsPick === 1,
        isBestSeller: row.isBestSeller === 'true' || row.isBestSeller === true || row.isBestSeller === 1,
        isTrending: row.isTrending === 'true' || row.isTrending === true || row.isTrending === 1,
        longDescription: row.longDescription ? row.longDescription.toString() : description.toString().trim(),
        specifications: specs
      });

      // Track duplicate state locally so multi-row inserts inside the same batch skip correctly
      existingNames.add(cleanName.toLowerCase());
    }

    console.log(`Validation complete. Inserting ${productsToInsert.length} products in batches of ${batchSize}...`);

    // Chunk insert to support 10,000+ files efficiently without memory overflow
    for (let i = 0; i < productsToInsert.length; i += batchSize) {
      const batch = productsToInsert.slice(i, i + batchSize);
      try {
        await Product.insertMany(batch, { ordered: false });
        successCount += batch.length;
        console.log(`Processed batch ${Math.floor(i / batchSize) + 1}... (${successCount}/${productsToInsert.length})`);
      } catch (insertErr) {
        if (insertErr.writeErrors) {
          successCount += batch.length - insertErr.writeErrors.length;
          errorCount += insertErr.writeErrors.length;
          insertErr.writeErrors.forEach(we => {
            errorsList.push(`Batch index error ${we.index + i}: ${we.errmsg}`);
          });
        } else {
          console.error(`Fatal batch insertion error: ${insertErr.message}`);
          break;
        }
      }
    }

    console.log('\n--- Seeding Process Finished ---');
    console.log(`Success Count: ${successCount} products imported.`);
    console.log(`Duplicate Count: ${skipCount} products skipped.`);
    console.log(`Error Count: ${errorCount} records failed.`);

    if (errorsList.length > 0) {
      console.log('\nFailed Records Report (First 15 errors):');
      errorsList.slice(0, 15).forEach(e => console.log(`  - ${e}`));
    }
  } catch (err) {
    console.error('Seeding process encountered a fatal crash:', err);
  } finally {
    mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
    process.exit(0);
  }
};

runSeeder();
