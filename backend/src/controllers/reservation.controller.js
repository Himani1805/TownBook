const Reservation = require('../models/reservation.model.js');
const User = require('../models/user.model.js');
const Book = require('../models/book.model.js');
const Room = require('../models/room.model.js');
const Notification = require('../models/notification.model.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// @desc    Get user reservations
// @route   GET /api/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id })
            .populate('itemId', 'title name')
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reservations.length,
            data: reservations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
exports.getReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findOne({
            _id: req.params.id,
            user: req.user._id
        })
        .populate('itemId', 'title name');

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
exports.createReservation = async (req, res, next) => {
    try {
        const { type, itemId, startDate, endDate, startTime, endTime } = req.body;

        // Validate item exists
        let item;
        if (type === 'Book') {
            item = await Book.findById(itemId);
        } else if (type === 'Room') {
            item = await Room.findById(itemId);
        }

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        // For rooms, check availability
        if (type === 'Room') {
            const isAvailable = await checkRoomAvailability(
                item,
                startDate,
                endDate,
                startTime,
                endTime
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Item is not available for the requested time slot'
                });
            }
        }

        // Create reservation
        const reservation = await Reservation.create({
            user: req.user._id,
            type,
            itemId,
            startDate,
            endDate,
            startTime,
            endTime
        });

        // Add reservation to item's reservations array
        item.reservations.push(reservation._id);
        await item.save();

        // Create notification for librarian
        const librarians = await User.find({ role: 'Librarian' });
        for (const librarian of librarians) {
            await Notification.create({
                user: librarian._id,
                title: 'New Reservation',
                message: `${req.user.name} has requested to reserve ${type === 'Book' ? item.title : item.name}`,
                type: 'Reservation',
                relatedId: reservation._id
            });
        }

        res.status(201).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve reservation
// @route   PUT /api/reservations/:id/approve
// @access  Private (Librarian only)
exports.approveReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Reservation is not in pending state'
            });
        }

        // For rooms, check availability again
        if (reservation.type === 'Room') {
            const item = await Room.findById(reservation.itemId);
            const isAvailable = await checkRoomAvailability(
                item,
                reservation.startDate,
                reservation.endDate,
                reservation.startTime,
                reservation.endTime
            );

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: 'Room is not available for the requested time slot'
                });
            }
        }

        // For books, update availability
        if (reservation.type === 'Book') {
            const book = await Book.findById(reservation.itemId);
            if (book.availableCopies <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Book is currently out of stock'
                });
            }
            book.availableCopies -= 1;
            await book.save();
        }

        reservation.status = 'Approved';
        reservation.approvedBy = req.user._id;
        reservation.approvedAt = new Date();
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Approved',
            message: `Your reservation for ${reservation.type === 'Book' ? 'the book' : 'the room'} has been approved`,
            type: 'Reservation',
            relatedId: reservation._id
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Decline reservation
// @route   PUT /api/reservations/:id/decline
// @access  Private (Librarian only)
exports.declineReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Reservation is not in pending state'
            });
        }

        reservation.status = 'Declined';
        reservation.approvedBy = req.user._id;
        reservation.approvedAt = new Date();
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Declined',
            message: `Your reservation for ${reservation.type === 'Book' ? 'the book' : 'the room'} has been declined`,
            type: 'Reservation',
            relatedId: reservation._id
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Checkout reservation
// @route   PUT /api/reservations/:id/checkout
// @access  Private (Librarian only)
exports.checkoutReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.status !== 'Approved') {
            return res.status(400).json({
                success: false,
                message: 'Reservation must be approved first'
            });
        }

        reservation.status = 'Checked Out';
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Checked Out',
            message: `Your reservation for ${reservation.type === 'Book' ? 'the book' : 'the room'} has been checked out`,
            type: 'Reservation',
            relatedId: reservation._id
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Return reservation
// @route   PUT /api/reservations/:id/return
// @access  Private (Librarian only)
exports.returnReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.status !== 'Checked Out') {
            return res.status(400).json({
                success: false,
                message: 'Reservation must be checked out to return'
            });
        }

        reservation.status = 'Returned';
        reservation.returnedAt = new Date();
        await reservation.save();

        // For books, update availability
        if (reservation.type === 'Book') {
            const book = await Book.findById(reservation.itemId);
            book.availableCopies += 1;
            await book.save();
        }

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Returned',
            message: `Your reservation for ${reservation.type === 'Book' ? 'the book' : 'the room'} has been returned`,
            type: 'Reservation',
            relatedId: reservation._id
        });

        res.status(200).json({
            success: true,
            data: reservation
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        // Remove reservation from item's reservations array
        if (reservation.type === 'Book') {
            const book = await Book.findById(reservation.itemId);
            book.reservations.pull(reservation._id);
            await book.save();
        } else if (reservation.type === 'Room') {
            const room = await Room.findById(reservation.itemId);
            room.reservations.pull(reservation._id);
            await room.save();
        }

        await reservation.remove();

        res.status(200).json({
            success: true,
            message: 'Reservation removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to check room availability
const checkRoomAvailability = async (room, startDate, endDate, startTime, endTime) => {
    // Convert times to 24-hour format
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    // Check if requested time overlaps with existing reservations
    const overlappingReservations = await Reservation.find({
        itemId: room._id,
        type: 'Room',
        status: 'Approved',
        $and: [
            {
                $or: [
                    { startDate: { $lte: endDateTime } },
                    { endDate: { $gte: startDateTime } }
                ]
            },
            {
                $or: [
                    { startTime: { $lte: endTime } },
                    { endTime: { $gte: startTime } }
                ]
            }
        ]
    });

    return overlappingReservations.length === 0;
};
