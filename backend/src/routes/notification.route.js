const express = require('express');
const {
    getNotifications,
    getNotification,
    markAsRead,
    markAllAsRead
} = require('../controllers/notification.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Protected routes
router.use(protect);

router.get('/', getNotifications);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
