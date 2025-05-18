const express = require('express');
const { 
    getBooks, 
    getBook, 
    createBook, 
    updateBook, 
    deleteBook, 
    searchBooks, 
    getBookReservations,
    reserveBook,
    approveBookReservation,
    declineBookReservation,
    checkoutBook,
    returnBook
} = require('../controllers/book.controller.js');
const { protect, authorize } = require('../middlewares/auth.middleware.js');
const router = express.Router();

// Public routes
router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/:id', getBook);

// Protected routes
router.use(protect);

// Member routes
router.post('/reserve/:id', reserveBook);
router.get('/reservations/:id', getBookReservations);

// Librarian routes
router.use(authorize('Librarian'));
router.post('/', createBook);
router.put('/:id', updateBook);
router.delete('/:id', deleteBook);
router.put('/approve-reservation/:id', approveBookReservation);
router.put('/decline-reservation/:id', declineBookReservation);
router.put('/checkout/:id', checkoutBook);
router.put('/return/:id', returnBook);

module.exports = router;
