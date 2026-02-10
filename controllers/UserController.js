const { db } = require('../db');

// Retrieve all users, with optional role filter (e.g. /users?role=technician)
const RetrieveAllUsers = (req, res) => {
    const { role } = req.query || {};

    let sql = `SELECT * FROM User`;
    const params = [];

    if (role) {
        sql += ` WHERE role = ?`;
        params.push(role);
    }

    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: "Error retrieving users" });
        res.status(200).json({ message: "Users retrieved successfully", data: rows });
    });
};

const RetrieveUserById = (req, res) => {
    const id = Number(req.params.id);
    db.get(`SELECT * FROM User WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: "Error retrieving user" });
        if (!row) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "User retrieved successfully", data: row });
    });
};

const CreateUser = (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) return res.status(400).json({ error: "Missing required fields" });

    db.run(`INSERT INTO User (name, email, password, role) VALUES (?, ?, ?, ?)`, [name, email, password, role], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "User created successfully", id: this.lastID });
    });
};

const UpdateUserById = (req, res) => {
    const id = Number(req.params.id);
    const { name, email, password, role } = req.body;

    db.run(`UPDATE User SET name = ?, email = ?, password = ?, role = ? WHERE id = ?`,
        [name, email, password, role, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "User not found" });
            res.status(200).json({ message: `User with id ${id} updated successfully` });
        }
    );
};

const DeleteUserById = (req, res) => {
    const id = Number(req.params.id);
    db.run(`DELETE FROM User WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: `User with id ${id} deleted successfully` });
    });
};

module.exports = { RetrieveAllUsers, RetrieveUserById, CreateUser, UpdateUserById, DeleteUserById };
