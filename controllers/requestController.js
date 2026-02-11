const { db } = require('../db');

const RetrieveAllRequests = (req, res) => {
    const sql = `
        SELECT
            r.*,
            u.name AS technician_name
        FROM Request r
        LEFT JOIN User u
            ON r.technician_id = u.id
    `;

    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error retrieving requests" });
        res.status(200).json({ message: "Requests retrieved successfully", data: rows });
    });
};

const RetrieveRequestById = (req, res) => {
    const id = Number(req.params.id);

    const sql = `
        SELECT
            r.*,
            u.name AS technician_name
        FROM Request r
        LEFT JOIN User u
            ON r.technician_id = u.id
        WHERE r.id = ?
    `;

    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ error: "Error retrieving request" });
        if (!row) return res.status(404).json({ error: "Request not found" });
        res.status(200).json({ message: "Request retrieved successfully", data: row });
    });
};

const CreateRequest = (req, res) => {
    const { title, location, category, language, priority, description } = req.body;

    if (!title || !location || !category || !priority || !description)
        return res.status(400).json({ error: "Missing required fields" });

    const sql = `
        INSERT INTO Request (title, location, category, language, priority, description, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
    `;

    db.run(sql, [title, location, category, language || null, priority, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        db.get(`SELECT * FROM Request WHERE id = ?`, [this.lastID], (err, row) => {
            if (err) return res.status(500).json({ error: "Error fetching request" });
            res.status(201).json({ message: "Request created successfully", data: row });
        });
    });
};

const AssignRequest = (req, res) => {
    const requestId = Number(req.params.id);
    const { technicianId } = req.body;

    const sql = `
        UPDATE Request
        SET technician_id = ?, status = 'assigned'
        WHERE id = ?
    `;

    db.run(sql, [technicianId, requestId], function(err) {
        if (err) return res.status(500).json({ error: "Error assigning request" });
        if (this.changes === 0) return res.status(404).json({ error: "Request not found" });

        db.get(`SELECT * FROM Request WHERE id = ?`, [requestId], (err, row) => {
            if (err) return res.status(500).json({ error: "Error fetching request" });
            res.status(200).json({ message: "Request assigned successfully", data: row });
        });
    });
};


const UpdateRequestById = (req, res) => {
    const requestId = Number(req.params.id);
    const { technician_id, technicianId, status } = req.body;

    if (Number.isNaN(requestId)) {
        return res.status(400).json({ error: "Invalid request id" });
    }

    const hasTechField = technician_id !== undefined && technician_id !== null
        || technicianId !== undefined && technicianId !== null;
    const hasStatusField = typeof status === 'string' && status.trim() !== '';

    if (!hasTechField && !hasStatusField) {
        return res.status(400).json({ error: "Provide technician_id/technicianId and/or status" });
    }

    const setClauses = [];
    const params = [];

    if (hasTechField) {
        const rawTech = technician_id !== undefined && technician_id !== null
            ? technician_id
            : technicianId;
        const techId = Number(rawTech);
        if (Number.isNaN(techId)) {
            return res.status(400).json({ error: "technician_id/technicianId must be numeric" });
        }
        setClauses.push('technician_id = ?');
        params.push(techId);

        
        if (!hasStatusField) {
            setClauses.push('status = ?');
            params.push('assigned');
        }
    }

    if (hasStatusField) {
        const trimmedStatus = status.trim();
        if (!['pending', 'in_progress', 'completed', 'assigned'].includes(trimmedStatus)) {
            return res.status(400).json({ error: "Invalid status value" });
        }

        setClauses.push('status = ?');
        params.push(trimmedStatus);
    }

    const sql = `
        UPDATE Request
        SET ${setClauses.join(', ')}
        WHERE id = ?
    `;

    params.push(requestId);

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: "Error updating request" });
       
        db.get(`SELECT * FROM Request WHERE id = ?`, [requestId], (err, row) => {
            if (err) return res.status(500).json({ error: "Error fetching request" });
            res.status(200).json({ message: "Request updated successfully", data: row || null });
        });
    });
};

const GetTechnicianRequests = (req, res) => {
    const techId = req.user.userId;

    db.all(`SELECT * FROM Request WHERE technician_id = ?`, [techId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Error retrieving technician requests" });
        res.status(200).json({ data: rows });
    });
};

const ApproveRequest = (req, res) => {
    const id = Number(req.params.id);

    db.run(
        `UPDATE Request SET status = 'in_progress' WHERE id = ?`,
        [id],
        function(err){
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Request approved" });
        }
    );
};

const UpdateStatus = (req, res) => {
    const requestId = Number(req.params.id);
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: "Status is required" });

    let sql;
    let params;

    if (status === 'completed') {
        sql = `UPDATE Request SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?`;
        params = [status, requestId];
    } else {
        sql = `UPDATE Request SET status = ? WHERE id = ?`;
        params = [status, requestId];
    }

    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: "Error updating status" });
        if (this.changes === 0) return res.status(404).json({ error: "Request not found" });

        db.get(`SELECT * FROM Request WHERE id = ?`, [requestId], (err, row) => {
            if (err) return res.status(500).json({ error: "Error fetching request" });
            res.status(200).json({ message: "Status updated successfully", data: row });
        });
    });
};

const DeleteRequestById = (req, res) => {
    const id = Number(req.params.id);
    db.run(`DELETE FROM Request WHERE id = ?`, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "Request not found" });
        res.status(200).json({ message: `Request with id ${id} deleted successfully` });
    });
};

module.exports = {
    RetrieveAllRequests,
    RetrieveRequestById,
    CreateRequest,
    AssignRequest,
    UpdateRequestById,
    GetTechnicianRequests,
    ApproveRequest,
    UpdateStatus,
    DeleteRequestById
};
