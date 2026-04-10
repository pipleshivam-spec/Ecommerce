const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload.middleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Product images (Admin only)
router.post(
  '/product-image',
  verifyToken,
  verifyAdmin,
  upload.single('image'),
  uploadController.uploadProductImage
);

router.post(
  '/product-images',
  verifyToken,
  verifyAdmin,
  upload.array('images', 10),
  uploadController.uploadMultipleImages
);

// Category image (Admin only)
router.post(
  '/category-image',
  verifyToken,
  verifyAdmin,
  upload.single('image'),
  uploadController.uploadCategoryImage
);

// Review images (Authenticated users)
router.post(
  '/review-images',
  verifyToken,
  upload.array('images', 5),
  uploadController.uploadReviewImages
);

// Delete image (Admin only)
router.delete(
  '/:public_id',
  verifyToken,
  verifyAdmin,
  uploadController.deleteImage
);

module.exports = router;
