const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter.middleware.js');
const { swaggerUi, swaggerDocs } = require('./config/swagger.js');
const { globalErrorHandler } = require('./middlewares/error.middleware.js');
const { validateResult } = require('./middlewares/validation.middleware.js');
const { requestLogger, errorLogger, responseLogger } = require('./middlewares/requestLogger.middleware.js');
const logger = require('./utils/logger');


// Log startup
logger.info('Starting TownBook server...');


// Import routes
const userRoutes = require('./routes/user.route.js');
const bookRoutes = require('./routes/book.route.js');
const roomRoutes = require('./routes/room.route.js');
const reservationRoutes = require('./routes/reservation.route.js');
const notificationRoutes = require('./routes/notification.route.js');
const morgan = require('morgan');

// Initialize express app
const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({
    origin: ['https://town-book-two.vercel.app', 'http://localhost:5173', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(cookieParser());
morgan.token('body', (req) => JSON.stringify(req.body));
morgan.token('error', (req, res) => res.statusCode >= 400 ? 'Error' : 'Success');
app.use(morgan(':date[iso] :method :url :status :response-time ms - :error - :body'));;

// Request logging
app.use(requestLogger);

// We have to Add this after your middleware setup but before your routes for the Swagger UI to work correctly.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Apply rate limiting to all routes
app.use('/api', apiLimiter);
// Apply stricter rate limiting to auth routes
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);

// Response logging
app.use(responseLogger);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/notifications', notificationRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Welcome to TownBook API');
});

// Error logging
app.use(errorLogger);

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;