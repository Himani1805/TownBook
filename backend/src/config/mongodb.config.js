const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!MONGODB_URI) {
        logger.error('No MongoDB connection string provided');
        process.exit(1);
    }

    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
            socketTimeoutMS: 45000,
            keepAlive: true,
            keepAliveInitialDelay: 300000,
            retryWrites: true,
            w: 'majority'
        });
        
        logger.info('MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        logger.error('Connection string:', MONGODB_URI);
        process.exit(1);
    }
};

module.exports = connectDB;
