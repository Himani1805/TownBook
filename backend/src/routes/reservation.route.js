const express = require('express');
const {
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
    deleteReservation,
    approveReservation,
    declineReservation,
    checkoutReservation,
    returnReservation
} = require('../controllers/reservation.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Log route initialization
const logger = require('../utils/logger');
logger.info('Initializing reservation routes');

// Protected routes
router.use(protect);

// Protected routes
router.use(protect);

// Member routes
router.get('/', getReservations);
router.get('/:id', getReservation);
router.post('/reserve', createReservation);

// Librarian routes
router.use(authorize('Librarian'));
router.put('/:id/approve', approveReservation);
router.put('/:id/decline', declineReservation);
router.put('/:id/checkout', checkoutReservation);
router.put('/:id/return', returnReservation);
router.delete('/:id', deleteReservation);

module.exports = router;
