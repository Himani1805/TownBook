const express = require('express');
const { registerUser, loginUser, getMe, updateProfile, updatePassword, forgotPassword, resetPassword, uploadProfileImage } = require('../controllers/user.controller.js');
const { protect } = require('../middlewares/auth.middleware.js');
const upload = require('../middlewares/fileUpload.middleware.js');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.put('/profile-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;