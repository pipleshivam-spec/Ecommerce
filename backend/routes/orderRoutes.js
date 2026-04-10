const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Protected routes (authenticated users)
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getUserOrders);
router.get('/:id', verifyToken, orderController.getOrderById);

// Admin routes
router.get('/', verifyToken, verifyAdmin, orderController.getAllOrders);
router.put('/:id/status', verifyToken, verifyAdmin, orderController.updateOrderStatus);
router.delete('/:id', verifyToken, verifyAdmin, orderController.deleteOrder);
router.get('/stats/dashboard', verifyToken, verifyAdmin, orderController.getDashboardStats);

module.exports = router;
