const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(verifyToken);

// Create Razorpay order
router.post('/create-order', paymentController.createOrder);

// Verify payment
router.post('/verify', paymentController.verifyPayment);

// Handle payment failure
router.post('/failure', paymentController.handlePaymentFailure);

// Get payment details
router.get('/order/:orderId', paymentController.getPaymentDetails);

module.exports = router;
