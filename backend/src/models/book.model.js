const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Please provide an author'],
        trim: true
    },
    isbn: {
        type: String,
        unique: true,
        sparse: true
    },
    description: {
        type: String,
        trim: true
    },
    genre: {
        type: String,
        enum: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Literature', 'Children', 'Other'],
        default: 'Other'
    },
    coverImage: {
        type: String,
        default: 'https://res.cloudinary.com/dgbymqjtk/image/upload/v1747415012/book_default.png'
    },
    totalCopies: {
        type: Number,
        default: 1,
        min: 1
    },
    availableCopies: {
        type: Number,
        default: 1,
        min: 0
    },
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Out of Stock'],
        default: 'Available'
    },
    location: {
        type: String,
        required: [true, 'Please provide a location'],
        trim: true
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
