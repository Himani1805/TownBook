const morgan = require('morgan');
const logger = require('../utils/logger');

// Morgan format for request logging
const requestLogger = morgan(':remote-addr - :method :url :status :res[content-length] - :response-time ms', {
    stream: {
        write: (message) => {
            logger.info(message.trim());
        }
    }
});

// Error logging middleware
const errorLogger = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, {
        stack: err.stack,
        method: req.method,
        url: req.url,
        status: err.statusCode || 500,
        timestamp: new Date().toISOString(),
        user: req.user ? {
            id: req.user._id,
            email: req.user.email,
            role: req.user.role
        } : null,
        params: req.params,
        query: req.query,
        body: req.body
    });
    next(err);
};

// Response logging middleware
const responseLogger = (req, res, next) => {
    const start = Date.now();
    const end = res.end;
    res.end = (...args) => {
        const duration = Date.now() - start;
        logger.info(`Response: ${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
            method: req.method,
            url: req.url,
            status: res.statusCode,
            duration,
            timestamp: new Date().toISOString(),
            user: req.user ? {
                id: req.user._id,
                email: req.user.email,
                role: req.user.role
            } : null,
            params: req.params,
            query: req.query,
            response: args[0]
        });
        end.apply(res, args);
    };
    next();
};

module.exports = {
    requestLogger,
    errorLogger,
    responseLogger
};
