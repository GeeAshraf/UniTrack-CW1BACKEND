const express = require('express');
const { signup, login, logout } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../validator');
const protect = require('../middleware/projectRoute');

const router = express.Router();

router.post('/signup', validateSignup, signup);

router.post('/login', validateLogin, login);

router.get('/me', protect, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const { userId, role } = req.user;

    res.json({
        data: {
            id: userId,
            user_id: userId,
            userId,
            role
        }
    });
});

router.post('/logout', protect, logout);

module.exports = router;