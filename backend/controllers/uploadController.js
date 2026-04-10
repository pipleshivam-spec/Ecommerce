const cloudinary = require('../config/cloudinary');
const { pool } = require('../config/db');

class UploadController {
  // Upload product image
  async uploadProductImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecommerce/products',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          public_id: result.public_id,
          width: result.width,
          height: result.height
        }
      });

    } catch (error) {
      console.error('Upload product image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload image'
      });
    }
  }

  // Upload multiple product images
  async uploadMultipleImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'ecommerce/products',
              transformation: [
                { width: 1000, height: 1000, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const images = results.map(result => ({
        url: result.secure_url,
        public_id: result.public_id,
        width: result.width,
        height: result.height
      }));

      res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: images
      });

    } catch (error) {
      console.error('Upload multiple images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload images'
      });
    }
  }

  // Upload category image
  async uploadCategoryImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'ecommerce/categories',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' },
              { fetch_format: 'auto' }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.status(200).json({
        success: true,
        message: 'Category image uploaded successfully',
        data: {
          url: result.secure_url,
          public_id: result.public_id
        }
      });

    } catch (error) {
      console.error('Upload category image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload category image'
      });
    }
  }

  // Upload review images
  async uploadReviewImages(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Limit to 5 images per review
      if (req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 5 images allowed per review'
        });
      }

      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'ecommerce/reviews',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          uploadStream.end(file.buffer);
        });
      });

      const results = await Promise.all(uploadPromises);

      const images = results.map(result => result.secure_url);

      res.status(200).json({
        success: true,
        message: 'Review images uploaded successfully',
        data: images
      });

    } catch (error) {
      console.error('Upload review images error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload review images'
      });
    }
  }

  // Delete image from Cloudinary
  async deleteImage(req, res) {
    try {
      const { public_id } = req.params;

      if (!public_id) {
        return res.status(400).json({
          success: false,
          message: 'Public ID is required'
        });
      }

      await cloudinary.uploader.destroy(public_id);

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });

    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete image'
      });
    }
  }
}

module.exports = new UploadController();
