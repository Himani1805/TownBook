const Reservation = require('../models/reservation.model.js');
const Book = require('../models/book.model.js');
const Room = require('../models/room.model.js');
const User = require('../models/user.model.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// @desc    Get library statistics
// @route   GET /api/analytics/stats
// @access  Private (Librarian only)
exports.getLibraryStats = async (req, res, next) => {
    try {
        // Get total books and rooms
        const [totalBooks, totalRooms] = await Promise.all([
            Book.countDocuments(),
            Room.countDocuments()
        ]);

        // Get active reservations
        const activeReservations = await Reservation.countDocuments({
            status: { $in: ['Pending', 'Approved', 'Checked Out'] }
        });

        // Get most popular books
        const popularBooks = await Reservation.aggregate([
            { $match: { type: 'book' } },
            { $group: {
                _id: '$itemId',
                count: { $sum: 1 }
            } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).exec();

        // Get most popular rooms
        const popularRooms = await Reservation.aggregate([
            { $match: { type: 'room' } },
            { $group: {
                _id: '$itemId',
                count: { $sum: 1 }
            } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]).exec();

        // Get user statistics
        const userStats = await User.aggregate([
            { $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: [{ $gt: ['$lastLogin', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)] }, 1, 0] } }
            } }
        ]).exec();

        res.status(200).json({
            success: true,
            data: {
                totalBooks,
                totalRooms,
                activeReservations,
                popularBooks,
                popularRooms,
                userStats: userStats[0]
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get reservation trends
// @route   GET /api/analytics/trends
// @access  Private (Librarian only)
exports.getReservationTrends = async (req, res, next) => {
    try {
        const startDate = new Date(req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const endDate = new Date(req.query.endDate || new Date());

        const trends = await Reservation.aggregate([
            { $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            } },
            { $group: {
                _id: {
                    $dateToString: {
                        format: '%Y-%m-%d',
                        date: '$createdAt'
                    }
                },
                total: { $sum: 1 },
                books: { $sum: { $cond: [{ $eq: ['$type', 'book'] }, 1, 0] } },
                rooms: { $sum: { $cond: [{ $eq: ['$type', 'room'] }, 1, 0] } }
            } },
            { $sort: { _id: 1 } }
        ]).exec();

        res.status(200).json({
            success: true,
            data: {
                trends,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user activity
// @route   GET /api/analytics/user-activity
// @access  Private (Librarian only)
exports.getUserActivity = async (req, res, next) => {
    try {
        const startDate = new Date(req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const endDate = new Date(req.query.endDate || new Date());

        const activity = await Reservation.aggregate([
            { $match: {
                createdAt: { $gte: startDate, $lte: endDate }
            } },
            { $group: {
                _id: '$user',
                totalReservations: { $sum: 1 },
                activeReservations: { $sum: { $cond: [{ $in: ['$status', ['Pending', 'Approved', 'Checked Out']] }, 1, 0] } }
            } },
            { $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            } },
            { $unwind: '$user' },
            { $project: {
                _id: 0,
                userId: '$_id',
                name: '$user.name',
                email: '$user.email',
                totalReservations: 1,
                activeReservations: 1
            } },
            { $sort: { totalReservations: -1 } },
            { $limit: 10 }
        ]).exec();

        res.status(200).json({
            success: true,
            data: {
                activity,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get resource usage
// @route   GET /api/analytics/resource-usage
// @access  Private (Librarian only)
exports.getResourceUsage = async (req, res, next) => {
    try {
        const startDate = new Date(req.query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const endDate = new Date(req.query.endDate || new Date());

        const bookUsage = await Reservation.aggregate([
            { $match: {
                type: 'book',
                createdAt: { $gte: startDate, $lte: endDate }
            } },
            { $group: {
                _id: '$itemId',
                totalReservations: { $sum: 1 },
                averageDuration: { $avg: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000] } }
            } },
            { $lookup: {
                from: 'books',
                localField: '_id',
                foreignField: '_id',
                as: 'book'
            } },
            { $unwind: '$book' },
            { $sort: { totalReservations: -1 } },
            { $limit: 10 }
        ]).exec();

        const roomUsage = await Reservation.aggregate([
            { $match: {
                type: 'room',
                createdAt: { $gte: startDate, $lte: endDate }
            } },
            { $group: {
                _id: '$itemId',
                totalReservations: { $sum: 1 },
                averageDuration: { $avg: { $subtract: ['$endDate', '$startDate'] } }
            } },
            { $lookup: {
                from: 'rooms',
                localField: '_id',
                foreignField: '_id',
                as: 'room'
            } },
            { $unwind: '$room' },
            { $sort: { totalReservations: -1 } },
            { $limit: 10 }
        ]).exec();

        res.status(200).json({
            success: true,
            data: {
                bookUsage,
                roomUsage,
                dateRange: {
                    start: startDate,
                    end: endDate
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
