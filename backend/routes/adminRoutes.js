const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard statistics
router.get('/stats', adminController.getDashboardStats);
router.get('/revenue', adminController.getRevenueData);
router.get('/top-products', adminController.getTopProducts);
router.get('/recent-orders', adminController.getRecentOrders);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/status', adminController.updateUserStatus);

// Order management
router.put('/orders/:orderId/status', adminController.updateOrderStatus);

module.exports = router;
