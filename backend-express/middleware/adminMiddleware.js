const pool = require('../config/db');

const adminMiddleware = async (req, res, next) => {
    try {
        const current_user = req.user;
        const [rows] = await pool.query("SELECT role FROM users WHERE id = ?", [current_user.id]);
        
        if (rows.length === 0 || rows[0].role !== 'admin') {
            return res.status(403).json({ detail: "Admin access required" });
        }
        next();
    } catch (err) {
        return res.status(500).json({ detail: "Server error" });
    }
};

module.exports = adminMiddleware;
