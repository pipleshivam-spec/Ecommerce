const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);

// Admin routes
router.get('/users', verifyToken, verifyAdmin, authController.getAllUsers);
router.delete('/users/:id', verifyToken, verifyAdmin, authController.deleteUser);

module.exports = router;
