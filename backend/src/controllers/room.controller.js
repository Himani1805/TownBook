const Room = require('../models/room.model.js');
const User = require('../models/user.model.js');
const Reservation = require('../models/reservation.model.js');
const cloudinary = require('../config/cloudinary.config.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Public
exports.getRooms = async (req, res, next) => {
    try {
        const rooms = await Room.find()
            .populate('addedBy', 'name')
            .sort('-createdAt');
        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single room
// @route   GET /api/rooms/:id
// @access  Public
exports.getRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id)
            .populate('addedBy', 'name')
            .populate({
                path: 'reservations',
                select: 'status startDate endDate user',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new room
// @route   POST /api/rooms
// @access  Private (Librarian only)
exports.createRoom = async (req, res, next) => {
    try {
        // Upload room image to Cloudinary
        if (req.files && req.files.roomImage) {
            const result = await cloudinary.uploader.upload(req.files.roomImage.path, {
                folder: 'Townbook/rooms',
                resource_type: 'image'
            });
            req.body.roomImage = result.secure_url;
        }

        req.body.addedBy = req.user._id;
        const room = await Room.create(req.body);

        res.status(201).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update room
// @route   PUT /api/rooms/:id
// @access  Private (Librarian only)
exports.updateRoom = async (req, res, next) => {
    try {
        let room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Update room image if new one is provided
        if (req.files && req.files.roomImage) {
            // Delete old image from Cloudinary
            if (room.roomImage) {
                const publicId = room.roomImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const result = await cloudinary.uploader.upload(req.files.roomImage.path, {
                folder: 'Townbook/rooms',
                resource_type: 'image'
            });
            req.body.roomImage = result.secure_url;
        }

        room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: room
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete room
// @route   DELETE /api/rooms/:id
// @access  Private (Librarian only)
exports.deleteRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Delete room image from Cloudinary
        if (room.roomImage) {
            const publicId = room.roomImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await room.remove();

        res.status(200).json({
            success: true,
            message: 'Room removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search rooms
// @route   GET /api/rooms/search
// @access  Public
exports.searchRooms = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        const rooms = await Room.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { location: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('addedBy', 'name')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get room schedule
// @route   GET /api/rooms/:id/schedule
// @access  Public
exports.getRoomSchedule = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            data: room.schedule
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reserve room
// @route   POST /api/rooms/reserve/:id
// @access  Private
exports.reserveRoom = async (req, res, next) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({
                success: false,
                message: 'Room not found'
            });
        }

        // Check room availability for requested time slot
        const isAvailable = await checkRoomAvailability(
            room,
            req.body.startDate,
            req.body.endDate,
            req.body.startTime,
            req.body.endTime
        );

        if (!isAvailable) {
            return res.status(400).json({
                success: false,
                message: 'Room is not available for the requested time slot'
            });
        }

        const reservation = await Reservation.create({
            user: req.user._id,
            type: 'Room',
            itemId: room._id,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            notes: req.body.notes
        });

        room.reservations.push(reservation._id);
        await room.save();

        // Create notification for librarian
        const librarians = await User.find({ role: 'Librarian' });
        for (const librarian of librarians) {
            await Notification.create({
                user: librarian._id,
                title: 'New Room Reservation',
                message: `${req.user.name} has requested to reserve ${room.name}`,
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

// @desc    Approve room reservation
// @route   PUT /api/rooms/approve-reservation/:id
// @access  Private (Librarian only)
exports.approveRoomReservation = async (req, res, next) => {
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

        // Check room availability again before approval
        const room = await Room.findById(reservation.itemId);
        const isAvailable = await checkRoomAvailability(
            room,
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

        reservation.status = 'Approved';
        reservation.approvedBy = req.user._id;
        reservation.approvedAt = new Date();
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Approved',
            message: `Your reservation for ${room.name} has been approved`,
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

// @desc    Decline room reservation
// @route   PUT /api/rooms/decline-reservation/:id
// @access  Private (Librarian only)
exports.declineRoomReservation = async (req, res, next) => {
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
            message: `Your reservation for ${room.name} has been declined`,
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

// @desc    Check in room
// @route   PUT /api/rooms/check-in/:id
// @access  Private (Librarian only)
exports.checkInRoom = async (req, res, next) => {
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

        reservation.status = 'Checked In';
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Room Checked In',
            message: `You have successfully checked into ${room.name}`,
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

// @desc    Check out room
// @route   PUT /api/rooms/check-out/:id
// @access  Private (Librarian only)
exports.checkOutRoom = async (req, res, next) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        if (reservation.status !== 'Checked In') {
            return res.status(400).json({
                success: false,
                message: 'Room must be checked in to check out'
            });
        }

        reservation.status = 'Checked Out';
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Room Checked Out',
            message: `You have successfully checked out of ${room.name}`,
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
