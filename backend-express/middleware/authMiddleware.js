const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ detail: "Invalid token" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_lost_and_found_2026');
        req.user = { id: parseInt(decoded.sub), email: decoded.email, role: decoded.role };
        next();
    } catch (err) {
        return res.status(401).json({ detail: "Invalid token" });
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_lost_and_found_2026');
            req.user = { id: parseInt(decoded.sub), email: decoded.email, role: decoded.role };
        } catch (err) {
            // Ignore invalid/expired token for optional authentication
        }
    }
    next();
};

authMiddleware.optionalAuth = optionalAuth;

module.exports = authMiddleware;
