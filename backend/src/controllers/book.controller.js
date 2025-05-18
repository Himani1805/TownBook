const Book = require('../models/book.model.js');
const User = require('../models/user.model.js');
const Reservation = require('../models/reservation.model.js');
const cloudinary = require('../config/cloudinary.config.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
exports.getBooks = async (req, res, next) => {
    try {
        const books = await Book.find()
            .populate('addedBy', 'name')
            .sort('-createdAt');
        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
exports.getBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('addedBy', 'name')
            // .populate({
            //     path: 'reservations',
            //     select: 'status startDate endDate user',
            //     populate: {
            //         path: 'user',
            //         select: 'name'
            //     }
            // });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Librarian only)
exports.createBook = async (req, res, next) => {
    try {
        // Upload cover image to Cloudinary
        if (req.files && req.files.coverImage) {
            const result = await cloudinary.uploader.upload(req.files.coverImage.path, {
                folder: 'Townbook/books',
                resource_type: 'image'
            });
            req.body.coverImage = result.secure_url;
        }

        req.body.addedBy = req.user._id;
        const book = await Book.create(req.body);

        res.status(201).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Librarian only)
exports.updateBook = async (req, res, next) => {
    try {
        let book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Update cover image if new one is provided
        if (req.files && req.files.coverImage) {
            // Delete old image from Cloudinary
            if (book.coverImage) {
                const publicId = book.coverImage.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            const result = await cloudinary.uploader.upload(req.files.coverImage.path, {
                folder: 'Townbook/books',
                resource_type: 'image'
            });
            req.body.coverImage = result.secure_url;
        }

        book = await Book.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Librarian only)
exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete cover image from Cloudinary
        if (book.coverImage) {
            const publicId = book.coverImage.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await book.remove();

        res.status(200).json({
            success: true,
            message: 'Book removed successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search books
// @route   GET /api/books/search
// @access  Public
exports.searchBooks = async (req, res, next) => {
    try {
        const query = req.query.q || '';
        const books = await Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } }
            ]
        })
        .populate('addedBy', 'name')
        .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: books.length,
            data: books
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get book reservations
// @route   GET /api/books/:id/reservations
// @access  Private
exports.getBookReservations = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate({
                path: 'reservations',
                select: 'status startDate endDate user',
                populate: {
                    path: 'user',
                    select: 'name'
                }
            });

        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book.reservations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reserve book
// @route   POST /api/books/reserve/:id
// @access  Private
exports.reserveBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Book is currently out of stock'
            });
        }

        const reservation = await Reservation.create({
            user: req.user._id,
            type: 'Book',
            itemId: book._id,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            notes: req.body.notes
        });

        book.reservations.push(reservation._id);
        book.availableCopies -= 1;
        await book.save();

        // Create notification for librarian
        const librarians = await User.find({ role: 'Librarian' });
        for (const librarian of librarians) {
            await Notification.create({
                user: librarian._id,
                title: 'New Book Reservation',
                message: `${req.user.name} has requested to reserve ${book.title}`,
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

// @desc    Approve book reservation
// @route   PUT /api/books/approve-reservation/:id
// @access  Private (Librarian only)
exports.approveBookReservation = async (req, res, next) => {
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

        reservation.status = 'Approved';
        reservation.approvedBy = req.user._id;
        reservation.approvedAt = new Date();
        await reservation.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Reservation Approved',
            message: `Your reservation for ${book.title} has been approved`,
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

// @desc    Decline book reservation
// @route   PUT /api/books/decline-reservation/:id
// @access  Private (Librarian only)
exports.declineBookReservation = async (req, res, next) => {
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
            message: `Your reservation for ${book.title} has been declined`,
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

// @desc    Checkout book
// @route   PUT /api/books/checkout/:id
// @access  Private (Librarian only)
exports.checkoutBook = async (req, res, next) => {
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
            title: 'Book Checked Out',
            message: `${book.title} has been checked out successfully`,
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

// @desc    Return book
// @route   PUT /api/books/return/:id
// @access  Private (Librarian only)
exports.returnBook = async (req, res, next) => {
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
                message: 'Book must be checked out to return'
            });
        }

        reservation.status = 'Returned';
        reservation.returnedAt = new Date();
        await reservation.save();

        // Update book availability
        const book = await Book.findById(reservation.itemId);
        book.availableCopies += 1;
        await book.save();

        // Create notification for user
        const user = await User.findById(reservation.user);
        await Notification.create({
            user: reservation.user,
            title: 'Book Returned',
            message: `${book.title} has been returned successfully`,
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
