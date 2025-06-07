const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const verifyToken = require('../middlewares/AuthMiddleware');

// Dashboard stats
router.get('/dashboard-stats', verifyToken, adminController.getDashboardStats);

// User management routes
router.get('/users', verifyToken, adminController.getAllUsers);
router.put('/users/update-role', verifyToken, adminController.updateUserRole);
router.delete('/users/:userId', verifyToken, adminController.deleteUser);

// Message management routes
router.get('/messages', verifyToken, adminController.getRecentMessages);
router.delete('/messages/:messageId', verifyToken, adminController.deleteMessage);


module.exports = router;