const jwt = require('jsonwebtoken');
const logEvent = require('../utilities/logger');
const { db } = require('../db'); 

module.exports = (req, res, next) => {
    try {
        const cookies = req.cookies || {};
        let token = cookies.token;

        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.split(' ')[1];
            }
        }

        if (!token) {
            logEvent(`AUTH FAILED | Missing Token | IP: ${req.ip}`);
            return res.status(401).json({
                error: "Not authenticated. Please log in."
            });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                logEvent(`AUTH FAILED | Token Expired | IP: ${req.ip}`);
                return res.status(401).json({ error: "Token expired. Please log in again." });
            }
            if (err.name === "JsonWebTokenError") {
                logEvent(`AUTH FAILED | Token Invalid | IP: ${req.ip}`);
                return res.status(401).json({ error: "Token invalid. Please log in again." });
            }
            logEvent(`AUTH FAILED | Token Verification Error: ${err.message} | IP: ${req.ip}`);
            return res.status(401).json({ error: "Authentication failed." });
        }

        const userId = decoded.userId || decoded.id;

        if (!userId) {
            logEvent(`AUTH FAILED | No userId in token | IP: ${req.ip}`);
            return res.status(401).json({ error: "Invalid authentication token." });
        }

        
        db.get(
            `SELECT id, role FROM User WHERE id = ?`,
            [userId],
            (err, user) => {
                if (err || !user) {
                    logEvent(`AUTH FAILED | User Not Found | UserID: ${userId} | IP: ${req.ip}`);
                    return res.status(401).json({ error: "User no longer exists." });
                }

                req.user = {
                    userId: user.id,
                    role: user.role
                };

                next();
            }
        );

    } catch (err) {
        logEvent(`AUTH FAILED | Unexpected Error: ${err.message} | IP: ${req.ip}`);
        return res.status(500).json({ error: "Server error during authentication." });
    }
};
