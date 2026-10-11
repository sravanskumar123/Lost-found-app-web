const pool = require('../config/db');

exports.getAllUsers = async (req, res) => {
    try {
        const role = req.query.role;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        let query = "SELECT id, name, email, phone, department, year, role, created_at FROM users";
        const params = [];

        if (role) {
            query += " WHERE role = ?";
            params.push(role);
        }

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [users] = await pool.query(query, params);
        return res.json(users);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getAllItems = async (req, res) => {
    try {
        const type = req.query.type;
        const status = req.query.status;
        const is_deleted = req.query.is_deleted;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        let query = `
            SELECT i.*, u.name AS owner_name, u.email AS owner_email
            FROM items i
            JOIN users u ON i.user_id = u.id
        `;
        const conditions = [];
        const params = [];

        if (type) {
            conditions.push("i.type = ?");
            params.push(type);
        }
        if (status) {
            conditions.push("i.status = ?");
            params.push(status);
        }
        if (is_deleted !== undefined) {
            conditions.push("i.is_deleted = ?");
            params.push(is_deleted === 'true' || is_deleted === '1' ? true : false);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" AND ");
        }

        query += " ORDER BY i.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [items] = await pool.query(query, params);
        return res.json(items);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getAllClaims = async (req, res) => {
    try {
        const status = req.query.status;

        let query = `
            SELECT c.*, 
                   u.name AS claimant_name, 
                   u.email AS claimant_email,
                   i.title AS item_title
            FROM claims c
            JOIN users u ON c.claimant_id = u.id
            JOIN items i ON c.item_id = i.id
        `;
        const params = [];

        if (status) {
            query += " WHERE c.status = ?";
            params.push(status);
        }

        const [claims] = await pool.query(query, params);
        return res.json(claims);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.softDeleteItem = async (req, res) => {
    try {
        const item_id = req.params.item_id;

        const [result] = await pool.query(`
            UPDATE items
            SET is_deleted = TRUE
            WHERE id = ? AND is_deleted = FALSE
        `, [item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ detail: "Item not found or already deleted" });
        }

        return res.json({ message: "Item soft deleted successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.restoreItem = async (req, res) => {
    try {
        const item_id = req.params.item_id;

        const [result] = await pool.query(`
            UPDATE items
            SET is_deleted = FALSE
            WHERE id = ? AND is_deleted = TRUE
        `, [item_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ detail: "Item not found or not deleted" });
        }

        return res.json({ message: "Item restored successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.forceRejectClaim = async (req, res) => {
    try {
        const claim_id = req.params.claim_id;

        const [rows] = await pool.query("SELECT id, status FROM claims WHERE id = ?", [claim_id]);
        const claim = rows[0];

        if (!claim) {
            return res.status(404).json({ detail: "Claim not found" });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({ detail: "Action already taken" });
        }

        await pool.query("UPDATE claims SET status = 'rejected' WHERE id = ?", [claim_id]);

        return res.json({ message: "Claim rejected successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.adminApproveClaim = async (req, res) => {
    try {
        const claim_id = req.params.claim_id;

        const [rows] = await pool.query("SELECT id, item_id, status FROM claims WHERE id = ?", [claim_id]);
        const claim = rows[0];

        if (!claim) {
            return res.status(404).json({ detail: "Claim not found" });
        }

        if (claim.status !== "pending") {
            return res.status(400).json({ detail: "Action already taken" });
        }

        const item_id = claim.item_id;

        await pool.query("UPDATE claims SET status = 'approved' WHERE id = ?", [claim_id]);
        await pool.query("UPDATE claims SET status = 'rejected' WHERE item_id = ? AND id != ?", [item_id, claim_id]);
        await pool.query("UPDATE items SET status = 'claimed' WHERE id = ? AND is_deleted = FALSE", [item_id]);

        return res.json({ message: "Claim approved successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.adminDashboard = async (req, res) => {
    try {
        const [usersRow] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
        const [itemsRow] = await pool.query("SELECT COUNT(*) AS total_items FROM items WHERE is_deleted = FALSE");
        const [lostRow] = await pool.query("SELECT COUNT(*) AS lost_count FROM items WHERE type = 'lost' AND is_deleted = FALSE");
        const [foundRow] = await pool.query("SELECT COUNT(*) AS found_count FROM items WHERE type = 'found' AND is_deleted = FALSE");
        const [activeRow] = await pool.query("SELECT COUNT(*) AS active_items FROM items WHERE status = 'active' AND is_deleted = FALSE");
        const [claimedRow] = await pool.query("SELECT COUNT(*) AS claimed_items FROM items WHERE status = 'claimed' AND is_deleted = FALSE");
        const [returnedRow] = await pool.query("SELECT COUNT(*) AS returned_items FROM items WHERE status = 'returned' AND is_deleted = FALSE");
        const [pendingClaimsRow] = await pool.query("SELECT COUNT(*) AS pending_claims FROM claims WHERE status = 'pending'");

        return res.json({
            total_users: usersRow[0].total_users,
            total_items: itemsRow[0].total_items,
            lost_count: lostRow[0].lost_count,
            found_count: foundRow[0].found_count,
            active_items: activeRow[0].active_items,
            claimed_items: claimedRow[0].claimed_items,
            returned_items: returnedRow[0].returned_items,
            pending_claims: pendingClaimsRow[0].pending_claims
        });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};
