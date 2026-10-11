const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.createClaim = async (req, res) => {
    try {
        const { item_id, message } = req.body;
        const current_user = req.user;
        const proof_image = req.file;

        const [itemRows] = await pool.query("SELECT * FROM items WHERE id = ?", [item_id]);
        const item = itemRows[0];

        if (!item) {
            return res.status(404).json({ detail: "Item not found" });
        }

        if (item.status !== "active") {
            return res.status(400).json({ detail: "Item not available" });
        }

        if (item.user_id === current_user.id) {
            return res.status(400).json({ detail: "Cannot claim your own item" });
        }

        const [existingClaim] = await pool.query(
            "SELECT * FROM claims WHERE item_id = ? AND claimant_id = ?",
            [item_id, current_user.id]
        );
        if (existingClaim.length > 0) {
            return res.status(400).json({ detail: "You already claimed this item" });
        }

        let image_url = null;

        if (proof_image) {
            const allowed_extensions = [".jpg", ".jpeg", ".png", ".webp"];
            const ext = path.extname(proof_image.originalname).toLowerCase();
            
            if (!allowed_extensions.includes(ext)) {
                return res.status(400).json({ detail: "Only image files are allowed" });
            }

            const MAX_FILE_SIZE = 5 * 1024 * 1024;
            if (proof_image.size > MAX_FILE_SIZE) {
                return res.status(400).json({ detail: "File too large (max 5MB)" });
            }

            const filename = `${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
            const uploadFolder = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadFolder)) {
                fs.mkdirSync(uploadFolder, { recursive: true });
            }
            const filePath = path.join(uploadFolder, filename);
            fs.renameSync(proof_image.path, filePath);

            image_url = filename;
        }

        await pool.query(
            `INSERT INTO claims (item_id, claimant_id, message, proof_image, status, created_at)
             VALUES (?, ?, ?, ?, 'pending', NOW())`,
            [item_id, current_user.id, message, image_url]
        );

        return res.json({ message: "Claim submitted successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getMyClaims = async (req, res) => {
    try {
        const current_user = req.user;
        const [claims] = await pool.query(
            `
            SELECT 
                c.id, c.item_id, c.status, c.message,
                i.title, i.location_name, i.status AS item_status,
                u.name AS owner_name,
                u.email AS owner_email,
                u.phone AS owner_phone
            FROM claims c
            JOIN items i ON c.item_id = i.id
            JOIN users u ON i.user_id = u.id
            WHERE c.claimant_id = ?
            ORDER BY c.created_at DESC
            `,
            [current_user.id]
        );

        return res.json(claims || []);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.viewClaimsForItem = async (req, res) => {
    try {
        const item_id = req.params.item_id;
        const current_user = req.user;

        const [itemRows] = await pool.query("SELECT * FROM items WHERE id = ?", [item_id]);
        const item = itemRows[0];

        if (!item) {
            return res.status(404).json({ detail: "Item not found" });
        }

        if (item.user_id !== current_user.id) {
            return res.status(403).json({ detail: "Not authorized" });
        }

        const [claims] = await pool.query(
            `
            SELECT 
                c.id, c.message, c.status, c.created_at,
                u.name, u.email, u.phone
            FROM claims c
            JOIN users u ON c.claimant_id = u.id
            WHERE c.item_id = ?
            ORDER BY c.created_at DESC
            `,
            [item_id]
        );

        return res.json(claims || []);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.approveClaim = async (req, res) => {
    try {
        const claim_id = req.params.claim_id;
        const current_user = req.user;

        const [claimRows] = await pool.query("SELECT * FROM claims WHERE id = ?", [claim_id]);
        const claim = claimRows[0];

        if (!claim) {
            return res.status(404).json({ detail: "Claim not found" });
        }

        const [itemRows] = await pool.query("SELECT * FROM items WHERE id = ?", [claim.item_id]);
        const item = itemRows[0];

        if (!item) {
            return res.status(404).json({ detail: "Item not found" });
        }

        if (item.user_id !== current_user.id) {
            return res.status(403).json({ detail: "Not authorized" });
        }

        if (item.status !== "active") {
            return res.status(400).json({ detail: "Item already claimed" });
        }

        await pool.query("UPDATE claims SET status = 'approved' WHERE id = ?", [claim_id]);
        await pool.query("UPDATE claims SET status = 'rejected' WHERE item_id = ? AND id != ?", [claim.item_id, claim_id]);
        await pool.query("UPDATE items SET status = 'claimed' WHERE id = ?", [claim.item_id]);

        const [ownerRows] = await pool.query("SELECT phone FROM users WHERE id = ?", [item.user_id]);
        const owner = ownerRows[0];

        return res.json({
            message: "Claim approved successfully",
            contact_phone: owner ? owner.phone : null
        });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.rejectClaim = async (req, res) => {
    try {
        const claim_id = req.params.claim_id;
        const current_user = req.user;

        const [claimRows] = await pool.query("SELECT * FROM claims WHERE id = ?", [claim_id]);
        const claim = claimRows[0];

        if (!claim) {
            return res.status(404).json({ detail: "Claim not found" });
        }

        const [itemRows] = await pool.query("SELECT * FROM items WHERE id = ?", [claim.item_id]);
        const item = itemRows[0];

        if (!item) {
            return res.status(404).json({ detail: "Item not found" });
        }

        if (item.user_id !== current_user.id) {
            return res.status(403).json({ detail: "Not authorized" });
        }

        await pool.query("UPDATE claims SET status = 'rejected' WHERE id = ?", [claim_id]);

        return res.json({ message: "Claim rejected successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};
