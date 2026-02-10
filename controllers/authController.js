const { db } = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logEvent = require('../utilities/logger.js');

const signToken = (userId, role) => {
    // Matching key names used in your protect middleware (userId/role)
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const signup = (req, res) => {
    let { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "Name, email, password, and role are required" });
    }

    role = role.trim().toLowerCase();
    password = password.trim();

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) return res.status(500).json({ error: "Error hashing password" });

        const query = `INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(query, [name, email, hashedPassword, role], function(err) {
            if (err) {
                logEvent(`SIGNUP FAILED | Email: ${email} | Reason: ${err.message} | IP: ${req.ip}`);
                if (err.message.includes("UNIQUE constraint failed")) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                return res.status(500).json({ error: "Error creating user" });
            }

            logEvent(`SIGNUP SUCCESS | UserID: ${this.lastID} | Email: ${email} | Role: ${role} | IP: ${req.ip}`);
            res.status(201).json({
                message: "User created successfully",
                user: { id: this.lastID, name, email, role }
            });
        });
    });
};

const login = (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: "Missing required fields" });

    const query = `SELECT * FROM User WHERE email = ?`;
    db.get(query, [email], (err, row) => {
        if (err) return res.status(500).json({ error: "Error retrieving user" });
        if (!row) {
            logEvent(`LOGIN FAILED | Email: ${email} | IP: ${req.ip}`);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        bcrypt.compare(password, row.password, (err, result) => {
            if (err) return res.status(500).json({ error: "Error comparing passwords" });
            if (!result) {
                logEvent(`LOGIN FAILED | Email: ${email} | IP: ${req.ip}`);
                return res.status(400).json({ error: "Invalid email or password" });
            }

            const token = signToken(row.id, row.role);

            // FIX 1: Changed cookie name to 'token' to match your middleware/auth logic
            res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'Lax', // Changed to Lax to help with local development redirect
                secure: false,   // Set to true in production
                maxAge: 15 * 60 * 1000
            });

            logEvent(`LOGIN SUCCESS | User: ${email} | Role: ${row.role} | IP: ${req.ip}`);

            // FIX 2: Ensure structure matches what login.js uses: data.data.role
            res.status(200).json({
                message: "Login successful",
                data: {
                    id: row.id,
                    name: row.name,
                    email: row.email,
                    role: row.role // login.js checks this for redirect
                }
            });
        });
    });
};

const logout = (req, res) => {
    // FIX 3: Clear the 'token' cookie
    res.clearCookie('token', { httpOnly: true, sameSite: 'Lax', secure: false });
    logEvent(`LOGOUT | UserID: ${req.user?.userId} | IP: ${req.ip}`);
    res.status(200).json({ message: "Logout successful" });
};

module.exports = { signup, login, logout };

