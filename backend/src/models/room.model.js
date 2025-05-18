const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a room name'],
        trim: true
    },
    capacity: {
        type: Number,
        required: [true, 'Please provide room capacity'],
        min: 1
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please provide room location'],
        trim: true
    },
    amenities: [{
        type: String,
        enum: ['WiFi', 'Projector', 'Whiteboard', 'Printers', 'Coffee', 'Other']
    }],
    status: {
        type: String,
        enum: ['Available', 'Reserved', 'Maintenance'],
        default: 'Available'
    },
    schedule: [{
        dayOfWeek: {
            type: Number,
            min: 0,
            max: 6
        },
        startTime: {
            type: String,
            match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$|(0[0-9]|1[0-2]):[0-5][0-9]\s*(am|pm|AM|PM)\b$/
        },
        endTime: {
            type: String,
            match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$|(0[0-9]|1[0-2]):[0-5][0-9]\s*(am|pm|AM|PM)\b$/
        }
    }],
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
