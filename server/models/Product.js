const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  brand: {
    type: String,
    required: [true, 'Product brand is required'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price must be positive']
  },
  images: [
    {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: false
      }
    }
  ],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewsCount: {
    type: Number,
    default: 24
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100']
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  isEditorsPick: {
    type: Boolean,
    default: false
  },
  longDescription: {
    type: String,
    default: ''
  },
  affiliateLink: {
    type: String,
    required: [true, 'Amazon affiliate link is required'],
    trim: true,
    match: [
      /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?/i,
      'Please fill a valid affiliate URL'
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
