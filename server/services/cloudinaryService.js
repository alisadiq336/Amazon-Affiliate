const fs = require('fs');
const path = require('path');
const { configureCloudinary, cloudinary } = require('../config/cloudinary');

const isCloudinaryActive = configureCloudinary();

const uploadImage = async (filePath) => {
  try {
    if (isCloudinaryActive) {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'amazon_affiliate_store'
      });
      // Delete temporary local file after uploading to Cloudinary
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } else {
      // Local fallback: Return relative URL path.
      // We keep the file in uploads/ and let Express serve it statically.
      const fileName = path.basename(filePath);
      return {
        url: `/uploads/${fileName}`,
        publicId: fileName
      };
    }
  } catch (error) {
    console.error('Image upload failed. Falling back to local file storage.', error);
    const fileName = path.basename(filePath);
    return {
      url: `/uploads/${fileName}`,
      publicId: fileName
    };
  }
};

const deleteImage = async (publicId) => {
  try {
    if (isCloudinaryActive && !publicId.includes('.')) {
      // Cloudinary public IDs don't usually have file extensions
      await cloudinary.uploader.destroy(publicId);
    } else {
      // Local file delete fallback
      const localPath = path.join(__dirname, '../uploads', publicId);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    }
    return true;
  } catch (error) {
    console.error('Image deletion failed:', error);
    return false;
  }
};

module.exports = { uploadImage, deleteImage };
