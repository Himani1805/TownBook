const Notification = require('../models/notification.model.js');
const User = require('../models/user.model.js');
const { protect } = require('../middlewares/auth.middleware.js');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single notification
// @route   GET /api/notifications/:id
// @access  Private
exports.getNotification = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({
            success: true,
            data: notification
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res, next) => {
    try {
        const notifications = await Notification.updateMany(
            { user: req.user._id },
            { read: true }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to send email notification
const sendEmailNotification = async (user, subject, message) => {
    try {
        // Your email sending logic here
        // This could be using nodemailer or any other email service
        console.log(`Sending email to ${user.email}: ${subject}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

// Helper function to send push notification
const sendPushNotification = async (user, title, message) => {
    try {
        // Your push notification logic here
        // This could be using Firebase Cloud Messaging or other services
        console.log(`Sending push notification to ${user.id}: ${title}`);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
};

// Helper function to create and send notification
exports.createAndSendNotification = async (user, title, message, type, relatedId, metadata) => {
    try {
        const notification = await Notification.create({
            user: user._id,
            title,
            message,
            type,
            relatedId,
            metadata
        });

        // Send email notification
        await sendEmailNotification(user, title, message);

        // Send push notification
        await sendPushNotification(user, title, message);

        return notification;
    } catch (error) {
        throw error;
    }
};
