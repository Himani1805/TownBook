const moment = require('moment');
const { ObjectId } = require('mongoose').Types;
const crypto = require('crypto');

// Helper function to generate unique IDs
exports.generateUniqueId = () => {
    return ObjectId().toString();
};

// Helper function to format date
exports.formatDate = (date) => {
    if (!date) return null;
    return moment(date).format('YYYY-MM-DD');
};

// Helper function to format time
exports.formatTime = (time) => {
    if (!time) return null;
    return moment(time, 'HH:mm').format('HH:mm');
};

// Helper function to check if dates overlap
exports.datesOverlap = (start1, end1, start2, end2) => {
    if (!start1 || !end1 || !start2 || !end2) return false;
    
    const s1 = new Date(start1);
    const e1 = new Date(end1);
    const s2 = new Date(start2);
    const e2 = new Date(end2);

    return s1 <= e2 && e1 >= s2;
};

// Helper function to calculate duration between dates
exports.calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end - start;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
};

// Helper function to check if user has active reservations
exports.hasActiveReservations = async (userId, type) => {
    const activeReservations = await Reservation.find({
        user: userId,
        type,
        status: { $in: ['Pending', 'Approved', 'Checked Out'] },
        endDate: { $gte: new Date() }
    });

    return activeReservations.length > 0;
};

// Helper function to calculate fines
exports.calculateFine = (reservation) => {
    if (!reservation.returnedAt) return 0;

    const dueDate = new Date(reservation.endDate);
    const returnDate = new Date(reservation.returnedAt);

    if (returnDate <= dueDate) return 0;

    const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
    const dailyFine = 5; // $5 per day fine

    return daysLate * dailyFine;
};

// Helper function to send reminder emails
exports.sendReminderEmail = async (user, item, type) => {
    // Your email sending logic here
    console.log(`Sending reminder to ${user.email} for ${type}: ${item.title || item.name}`);
};

// Helper function to generate QR code for check-in/check-out
exports.generateQRCode = (reservationId) => {
    return `https://townbook.com/checkout/${reservationId}`;
};

// Helper function to validate time format
exports.validateTime = (time) => {
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(time);
};

// Helper function to get available time slots
exports.getAvailableTimeSlots = (schedule, date) => {
    const dayOfWeek = new Date(date).getDay();
    const availableSlots = [];

    schedule.forEach(slot => {
        if (slot.dayOfWeek === dayOfWeek) {
            availableSlots.push({
                start: slot.startTime,
                end: slot.endTime
            });
        }
    });

    return availableSlots;
};

// Helper function to generate random password
exports.generateRandomPassword = (length = 12) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Helper function to generate password reset token
exports.generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

// Helper function to generate verification code
exports.generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
