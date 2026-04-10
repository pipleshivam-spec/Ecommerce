const express = require('express');
const router = express.Router();
const mockPaymentController = require('../controllers/mockPaymentController');
const { verifyToken } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.use(verifyToken);

// Mock payment endpoints (for demo/testing)
router.post('/mock/create-order', mockPaymentController.createOrder);
router.post('/mock/verify', mockPaymentController.verifyPayment);

module.exports = router;
