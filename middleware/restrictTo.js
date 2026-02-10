const logEvent = require('../utilities/logger');

module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            logEvent(`AUTH FAILED | No User Info | IP: ${req.ip}`);
            return res.status(401).json({ 
                error: "Not authenticated. Make sure auth middleware runs first." 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            logEvent(`AUTH DENIED | UserID: ${req.user.userId} | Required Roles: ${allowedRoles.join(', ')} | IP: ${req.ip}`);
            return res.status(403).json({ 
                error: "Access denied. Insufficient permissions." 
            });
        }

        next();
    };
};
