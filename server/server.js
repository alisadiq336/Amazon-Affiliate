const dotenv = require('dotenv');
// Load environment variables
dotenv.config();

const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');

// Connect to Database
connectDB();

// Seeder function to populate initial categories, products, and admin credentials
const seedData = async () => {
  try {
    // 1. Seed Administrator
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      await User.create({
        username: 'admin',
        email: 'admin@amazonstore.com',
        password: 'adminpassword123',
        role: 'admin'
      });
      console.log('---------------------------------------------------------');
      console.log('Seeded default Admin:');
      console.log('Email: admin@amazonstore.com');
      console.log('Password: adminpassword123');
      console.log('---------------------------------------------------------');
    }

    // 2. Seed Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const electronics = await Category.create({ name: 'Electronics' });
      const fashion = await Category.create({ name: 'Fashion & Clothing' });
      const home = await Category.create({ name: 'Home & Kitchen' });
      console.log('Seeded default categories: Electronics, Fashion, Home & Kitchen.');

      // 3. Seed Products
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        await Product.create([
          {
            name: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
            description: 'Industry-leading active noise canceling overhead headphones with intelligent smart listening technology and up to 30 hours of battery life.',
            brand: 'Sony',
            category: electronics._id,
            price: 348.00,
            images: [
              {
                url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                publicId: 'default_product_1'
              },
              {
                url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
                publicId: 'default_product_1_alt'
              }
            ],
            specifications: {
              'Connectivity': 'Bluetooth 5.0 & NFC',
              'Battery Life': 'Up to 30 Hours',
              'Noise Cancelling': 'Industry-Leading ANC',
              'Charging Type': 'USB-C Quick Charge'
            },
            rating: 4.8,
            reviewsCount: 312,
            discountPercent: 15,
            isBestSeller: true,
            isEditorsPick: true,
            longDescription: 'The Sony WH-1000XM4 remains the gold standard in premium noise-canceling headphones. After putting them through hundreds of hours of testing in noisy commutes and quiet office environments, our editors found their active noise cancellation to be class-leading.\n\n### Why We Recommend It\nWith dual noise-sensor technology and a powerful HD Noise Cancelling Processor QN1, these headphones create a near-silent bubble around you. They also support multipoint Bluetooth connection, allowing you to seamlessly switch between your laptop and phone.\n\n### Who It\'s For\nIdeal for frequent flyers, office workers, and students who require silence to concentrate. The plush earcups provide comfort for all-day wear.',
            affiliateLink: 'https://www.amazon.com/dp/B0863TXGM3'
          },
          {
            name: 'Minimalist Leather Slim RFID Blocking Wallet',
            description: 'Genuine full-grain leather front pocket wallet for men. Features space-saving RFID-blocking card holders with quick access slots.',
            brand: 'Sermon',
            category: fashion._id,
            price: 29.99,
            images: [
              {
                url: 'https://images.unsplash.com/photo-1627124765135-56af27e65b6f?w=800&auto=format&fit=crop&q=80',
                publicId: 'default_product_2'
              }
            ],
            specifications: {
              'Material': 'Full-Grain Leather',
              'RFID Blocking': 'Yes, 13.56 MHz',
              'Card Capacity': 'Up to 12 Cards',
              'Profile': 'Ultra-Slim Front Pocket'
            },
            rating: 4.5,
            reviewsCount: 89,
            discountPercent: 20,
            isTrending: true,
            longDescription: 'A ultra-slim wallet designed for modern minimalist carry. We tested it in front pockets, back pockets, and bags. It blocks RFID signals to protect your cards from wireless theft while maintaining a sleek, zero-bulk silhouette.\n\n### Why We Recommend It\nMade from premium full-grain leather, this wallet ages beautifully over time. It holds up to 12 cards and includes an integrated cash strap for quick access to your bills.\n\n### Who It\'s For\nPerfect for anyone looking to declutter their pockets and ditch heavy, traditional bifold wallets.',
            affiliateLink: 'https://www.amazon.com/dp/B07R8H4F6G'
          },
          {
            name: 'Electric Pour-Over Gooseneck Water Kettle',
            description: '1.0 Liter quick heating matte black kettle. Perfect temperature control for coffee drip-brews and specialty loose-leaf teas.',
            brand: 'Cosori',
            category: home._id,
            price: 69.99,
            images: [
              {
                url: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop&q=80',
                publicId: 'default_product_3'
              }
            ],
            specifications: {
              'Capacity': '1.0 Liter',
              'Material': '304 Food-Grade Stainless Steel',
              'Power Source': '1200 Watts / 120V',
              'Temp Accuracy': '+/- 1 Degree F'
            },
            rating: 4.7,
            reviewsCount: 142,
            discountPercent: 10,
            isBestSeller: true,
            longDescription: 'For pour-over coffee enthusiasts, temperature control is everything. The Cosori Gooseneck Kettle offers precise temperature controls down to the degree, ensuring optimal flavor extraction for both light and dark roasts.\n\n### Why We Recommend It\nIts elongated gooseneck spout gives you complete control over the water flow, which is essential for a balanced coffee extraction. The kettle also features a 1-hour Keep Warm function to maintain your target temperature.\n\n### Who It\'s For\nA must-have tool for pour-over coffee hobbyists, tea connoisseurs, and anyone who appreciates precision kitchen appliances.',
            affiliateLink: 'https://www.amazon.com/dp/B08B389DGL'
          }
        ]);
        console.log('Seeded default affiliate products.');
      }
    }
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
};

// Start data seeder
seedData();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down server...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
