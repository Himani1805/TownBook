class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Common error types
exports.BadRequestError = class BadRequestError extends AppError {
    constructor(message) {
        super(message, 400);
    }
};

exports.UnauthorizedError = class UnauthorizedError extends AppError {
    constructor(message) {
        super(message, 401);
    }
};

exports.ForbiddenError = class ForbiddenError extends AppError {
    constructor(message) {
        super(message, 403);
    }
};

exports.NotFoundError = class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
};

exports.ConflictError = class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
};

// Global error handling middleware
exports.globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        // Handle specific errors
        if (err.name === 'CastError') {
            const message = `Resource not found with ID: ${err.value}`;
            err = new exports.NotFoundError(message);
        }

        if (err.code === 11000) {
            const message = 'Duplicate field value entered';
            err = new exports.ConflictError(message);
        }

        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message);
            err = new exports.BadRequestError(message);
        }

        res.status(err.statusCode).json({
            success: false,
            message: err.message || 'Something went wrong'
        });
    }
};

// Handle duplicate key errors
exports.handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/"(.*?)"/)[1];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new exports.BadRequestError(message);
};

// Handle validation errors
exports.handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new exports.BadRequestError(message);
};

// Handle JWT errors
exports.handleJWTError = () => 
    new exports.UnauthorizedError('Invalid token. Please log in again!');

exports.handleJWTExpiredError = () => 
    new exports.UnauthorizedError('Your token has expired! Please log in again.');

// Custom error handler for file upload
exports.handleFileUploadError = (err) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return new exports.BadRequestError(`File size too large. Maximum size is 10MB`);
    }
    return new exports.BadRequestError(`Invalid file upload: ${err.message}`);
};

// Custom error handler for Cloudinary
exports.handleCloudinaryError = (err) => {
    if (err.message.includes('not found')) {
        return new exports.NotFoundError('Image not found in Cloudinary');
    }
    return new exports.BadRequestError(`Cloudinary error: ${err.message}`);
};
