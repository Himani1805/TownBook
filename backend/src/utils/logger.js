const fs = require('fs');
const path = require('path');
const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, printf, json, colorize } = format;

// Create logs directory if it doesn't exist
const logDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Custom format for logs
const customFormat = printf(({ level, message, timestamp, ...rest }) => {
    return `${timestamp} [${level.toUpperCase()}] ${message} ${Object.keys(rest).length ? JSON.stringify(rest) : ''}`;
});

// Create logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        // Console transport
        new winston.transports.Console({
            format: combine(
                colorize(),
                customFormat
            )
        }),
        // Error file transport
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: combine(
                json(),
                timestamp()
            )
        }),
        // Combined log file transport
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: combine(
                json(),
                timestamp()
            )
        })
    ]
});

// Add stream method to logger
logger.stream = {
    write: (message) => {
        logger.info(message);
    }
};

// Export logger
module.exports = logger;
