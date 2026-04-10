const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { verifyToken } = require('../middleware/authMiddleware');

// All checkout routes require authentication
router.use(verifyToken);

// Process checkout and create order
router.post('/process', checkoutController.processCheckout);

// Get order details
router.get('/order/:orderId', checkoutController.getOrderDetails);

// Get user orders
router.get('/orders', checkoutController.getUserOrders);

// Cancel order
router.put('/order/:orderId/cancel', checkoutController.cancelOrder);

module.exports = router;
