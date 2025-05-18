const { check, validationResult } = require('express-validator');
const { ObjectId } = require('mongoose').Types;

exports.validateBook = [
    check('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
    check('author')
        .trim()
        .notEmpty()
        .withMessage('Author is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Author name must be between 2 and 100 characters'),
    check('isbn')
        .optional()
        .trim()
        .matches(/^(?:ISBN(?:-13)?:?\s*(?:97[89])?\s*(?:\d[-\s]*){10,17})$/)
        .withMessage('Invalid ISBN format'),
    check('totalCopies')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Total copies must be a positive number'),
    check('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Location must be between 2 and 100 characters'),
    check('genre')
        .optional()
        .isIn(['Fiction', 'Non-Fiction', 'Science', 'History', 'Literature', 'Children', 'Other'])
        .withMessage('Invalid genre')
];

exports.validateRoom = [
    check('name')
        .trim()
        .notEmpty()
        .withMessage('Room name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Room name must be between 2 and 100 characters'),
    check('capacity')
        .isInt({ min: 1 })
        .withMessage('Capacity must be a positive number'),
    check('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Location must be between 2 and 100 characters'),
    check('amenities')
        .optional()
        .isArray()
        .withMessage('Amenities must be an array')
        .custom((value) => {
            const validAmenities = ['WiFi', 'Projector', 'Whiteboard', 'Printers', 'Coffee', 'Other'];
            return value.every(amenity => validAmenities.includes(amenity));
        })
        .withMessage('Invalid amenities'),
    check('schedule')
        .optional()
        .isArray()
        .withMessage('Schedule must be an array')
        .custom((value) => {
            return value.every(slot => {
                return slot.startTime && slot.endTime && slot.dayOfWeek;
            });
        })
        .withMessage('Invalid schedule format')
];

exports.validateReservation = [
    check('type')
        .isIn(['Book', 'Room'])
        .withMessage('Invalid reservation type'),
    check('itemId')
        .custom((value) => {
            if (!ObjectId.isValid(value)) {
                throw new Error('Invalid item ID');
            }
            return true;
        }),
    check('startDate')
        .isISO8601()
        .withMessage('Start date must be a valid date')
        .custom((value, { req }) => {
            const endDate = new Date(req.body.endDate);
            const startDate = new Date(value);
            if (startDate >= endDate) {
                throw new Error('Start date must be before end date');
            }
            return true;
        }),
    check('endDate')
        .isISO8601()
        .withMessage('End date must be a valid date'),
    check('startTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Start time must be in HH:MM format'),
    check('endTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('End time must be in HH:MM format')
];

exports.validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Custom validation for time slots
exports.validateTimeSlot = (req, res, next) => {
    const { startTime, endTime } = req.body;
    if (!startTime || !endTime) {
        return next();
    }

    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);

    if (start >= end) {
        return res.status(400).json({
            success: false,
            message: 'End time must be after start time'
        });
    }

    next();
};

// Custom validation for overlapping reservations
exports.validateNoOverlap = async (req, res, next) => {
    const { type, itemId, startDate, endDate, startTime, endTime } = req.body;
    if (!itemId || !startDate || !endDate) {
        return next();
    }

    try {
        const existingReservations = await Reservation.find({
            itemId,
            type,
            status: 'Approved',
            $and: [
                { startDate: { $lte: endDate } },
                { endDate: { $gte: startDate } }
            ]
        });

        if (existingReservations.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already reserved'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};
