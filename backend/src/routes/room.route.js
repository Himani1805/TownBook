const express = require('express');
const {
    getRooms,
    getRoom,
    createRoom,
    updateRoom,
    deleteRoom,
    searchRooms,
    getRoomSchedule,
    reserveRoom,
    approveRoomReservation,
    declineRoomReservation,
    checkInRoom,
    checkOutRoom
} = require('../controllers/room.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Public routes
router.get('/', getRooms);
router.get('/search', searchRooms);
router.get('/:id', getRoom);
router.get('/:id/schedule', getRoomSchedule);

// Protected routes
router.use(protect);

// Member routes
router.post('/reserve/:id', reserveRoom);

// Librarian routes
router.use(authorize('Librarian'));
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
router.put('/approve-reservation/:id', approveRoomReservation);
router.put('/decline-reservation/:id', declineRoomReservation);
router.put('/check-in/:id', checkInRoom);
router.put('/check-out/:id', checkOutRoom);

module.exports = router;
