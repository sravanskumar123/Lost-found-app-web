const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.checkEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ detail: "Email is required" });
        }
        
        const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        return res.json({ exists: rows.length > 0 });
    } catch (err) {
        return res.status(500).json({ detail: "Server error" });
    }
};

exports.register = async (req, res) => {
    try {
        const { name, email, phone, department, year, role, password } = req.body;
        
        // Email authenticity validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email || !emailRegex.test(email.trim())) {
            return res.status(400).json({ detail: "Please provide a valid email address (e.g. name@campus.edu)" });
        }

        // Phone authenticity validation (10 digits)
        const cleanPhone = (phone || "").replace(/\D/g, "");
        if (cleanPhone.length !== 10) {
            return res.status(400).json({ detail: "Please provide a valid 10-digit mobile phone number" });
        }

        const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email.trim()]);
        if (existingUser.length > 0) {
            return res.status(400).json({ detail: "This email address is already registered" });
        }

        const [existingPhone] = await pool.query("SELECT id FROM users WHERE phone = ?", [cleanPhone]);
        if (existingPhone.length > 0) {
            return res.status(400).json({ detail: "This phone number is already registered" });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userRole = role || "student";
        
        await pool.query(
            "INSERT INTO users (name, email, phone, department, year, role, password, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [name, email, phone || null, department || null, year || null, userRole, hashedPassword]
        );
        
        return res.json({ message: "User registered successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const email = req.body.username || req.body.email; 
        const password = req.body.password;
        
        if (!email || !password) {
            return res.status(400).json({ detail: "Username and password are required" });
        }
        
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];
        
        if (!user) {
            return res.status(401).json({ detail: "Invalid credentials" });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ detail: "Invalid credentials" });
        }
        
        const token = jwt.sign(
            { sub: user.id.toString(), email: user.email, role: user.role },
            process.env.JWT_SECRET || 'super_secret_jwt_key_lost_and_found_2026',
            { expiresIn: '7d' }
        );
        
        return res.json({
            access_token: token,
            token_type: "bearer",
            id: user.id,
            role: user.role,
            email: user.email,
            name: user.name
        });
        
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, name, email, phone, role FROM users WHERE id = ?", [req.user.id]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({ detail: "User not found" });
        }
        return res.json(rows[0]);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};
