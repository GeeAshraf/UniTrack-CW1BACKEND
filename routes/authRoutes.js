const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validator');
const protect = require('../middleware/projectRoute');

const router = express.Router();

// Signup (register) endpoint
router.post('/signup', validateSignup, signup);

// Login endpoint
router.post('/login', validateLogin, login);

// Current authenticated user info
router.get('/me', protect, (req, res) => {
    // req.user is populated by the protect middleware
    if (!req.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const { userId, role } = req.user;

    // Include multiple id-style fields to satisfy different frontend expectations
    res.json({
        data: {
            id: userId,
            user_id: userId,
            userId,
            role
        }
    });
});

// Logout 
router.post('/logout', protect, logout);

module.exports = router;