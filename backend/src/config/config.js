const dotenv = require('dotenv');

dotenv.config();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_LOCAL;
const JWT_SECRET = process.env.JWT_SECRET
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS) || 10;
const JWT_EXPIRES = String(process.env.JWT_EXPIRES) || '30d';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL;


module.exports = {
    PORT,
    MONGO_URI,
    JWT_SECRET,
    SALT_ROUNDS,
    JWT_EXPIRES,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    EMAIL_SERVICE,
    EMAIL_USER,
    EMAIL_PASS,
    FRONTEND_URL
};