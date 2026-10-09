const pool = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.createItem = async (req, res) => {
    try {
        const { type, title, category, description, date_event, location_name, latitude, longitude, status } = req.body;
        const current_user = req.user;
        const image = req.file;

        if (type === "found" && image) {
            return res.status(400).json({ detail: "Images are not allowed for found items" });
        }

        if (type === "lost" && image) {
            if (!image.mimetype.startsWith("image/")) {
                return res.status(400).json({ detail: "Only image files allowed" });
            }
            const MAX_FILE_SIZE = 20 * 1024 * 1024;
            if (image.size > MAX_FILE_SIZE) {
                return res.status(400).json({ detail: "File too large (max 5MB)" }); // Note: Python code said max 5MB but checked 20MB. Keeping message.
            }
        }

        let parsed_date = null;
        if (date_event) {
            const date = new Date(date_event);
            if (!isNaN(date.getTime())) {
                parsed_date = date;
            }
        }

        const itemStatus = status || "active";
        const latVal = (latitude !== undefined && latitude !== '' && latitude !== null && !isNaN(parseFloat(latitude))) ? parseFloat(latitude) : null;
        const lngVal = (longitude !== undefined && longitude !== '' && longitude !== null && !isNaN(parseFloat(longitude))) ? parseFloat(longitude) : null;

        const [result] = await pool.query(`
            INSERT INTO items
            (user_id, type, title, category, description, date_event,
             location_name, latitude, longitude, status, is_deleted)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
        `, [
            current_user.id, type, title, category, description, parsed_date,
            location_name, latVal, lngVal, itemStatus
        ]);

        const item_id = result.insertId;

        if (type === "lost" && image) {
            const filename = `${item_id}_${image.originalname}`;
            const uploadFolder = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadFolder)) {
                fs.mkdirSync(uploadFolder, { recursive: true });
            }
            const filePath = path.join(uploadFolder, filename);
            fs.renameSync(image.path, filePath);
            
            const relativePath = path.join('uploads', filename).replace(/\\/g, '/');

            await pool.query(
                "INSERT INTO item_images (item_id, image_url) VALUES (?, ?)",
                [item_id, relativePath]
            );
        }

        return res.json({ message: "Item created successfully", item_id: item_id });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getItems = async (req, res) => {
    try {
        const type = req.query.type;
        const status = req.query.status || "active";
        const search = req.query.search;
        const category = req.query.category;
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;

        let query = `
        SELECT i.*, img.image_url, u.name AS owner_name, u.phone AS owner_phone
        FROM items i
        LEFT JOIN item_images img ON i.id = img.item_id
        LEFT JOIN users u ON i.user_id = u.id
        WHERE i.is_deleted = FALSE
        `;

        const params = [];

        if (type) {
            query += " AND LOWER(i.type) = LOWER(?)";
            params.push(type);
        }
        if (status && status !== "all") {
            query += " AND LOWER(i.status) = LOWER(?)";
            params.push(status);
        }
        if (search) {
            query += " AND (LOWER(i.title) LIKE LOWER(?) OR LOWER(i.location_name) LIKE LOWER(?))";
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category && category !== "all") {
            query += " AND LOWER(i.category) = LOWER(?)";
            params.push(category);
        }

        query += " ORDER BY i.created_at DESC LIMIT ? OFFSET ?";
        params.push(limit, offset);

        const [items] = await pool.query(query, params);

        for (let item of items) {
            if (item.image_url) {
                const filename = path.basename(item.image_url);
                item.image_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            }
        }

        return res.json(items);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getMyItems = async (req, res) => {
    try {
        const current_user = req.user;
        const [items] = await pool.query(`
            SELECT 
                i.id, i.user_id, i.type, i.title, i.category, i.description, 
                i.location_name, i.status, i.created_at,
                COUNT(c.id) AS claim_count
            FROM items i
            LEFT JOIN claims c ON c.item_id = i.id
            WHERE i.user_id = ? AND i.is_deleted = FALSE
            GROUP BY i.id
            ORDER BY i.created_at DESC
        `, [current_user.id]);

        return res.json(items || []);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getSingleItem = async (req, res) => {
    try {
        const item_id = req.params.item_id;
        const [rows] = await pool.query(`
            SELECT i.*, img.image_url, u.name AS owner_name, u.phone AS owner_phone, u.email AS owner_email
            FROM items i
            LEFT JOIN item_images img ON i.id = img.item_id
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.id = ? AND i.is_deleted = FALSE
        `, [item_id]);

        const item = rows[0];
        if (!item) {
            return res.status(404).json({ detail: "Item not found" });
        }

        if (item.image_url) {
            const filename = path.basename(item.image_url);
            item.image_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
        }

        return res.json(item);
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.markItemReturned = async (req, res) => {
    try {
        const item_id = req.params.item_id;
        const current_user = req.user;

        const [result] = await pool.query(`
            UPDATE items
            SET status = 'returned'
            WHERE id = ?
            AND user_id = ?
            AND status = 'claimed'
            AND is_deleted = FALSE
        `, [item_id, current_user.id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ detail: "Item not found, not yours, or not in claimed state" });
        }

        return res.json({ message: "Item marked as returned successfully" });
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

function calculateMatchScore(source, candidate) {
    const sTitle = (source.title || "").toLowerCase().trim();
    const cTitle = (candidate.title || "").toLowerCase().trim();
    if (!sTitle || !cTitle) return { score: 0, matchPercentage: 0, reasons: [] };

    const stopWords = new Set([
        "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "my", "of", "is", "it",
        "lost", "found", "item", "someone", "please", "help", "me", "this", "that", "there", "i", "have"
    ]);
    const getTokens = (str) => (str || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));

    const sTitleTokens = getTokens(source.title);
    const cTitleTokens = getTokens(candidate.title);
    const sDescTokens = getTokens(source.description);
    const cDescTokens = getTokens(candidate.description);

    // 1. Direct title or substring containment
    const hasDirectTitleMatch = sTitle === cTitle || 
        (sTitle.length >= 4 && cTitle.includes(sTitle)) || 
        (cTitle.length >= 4 && sTitle.includes(cTitle));

    // Token overlaps
    const titleTokenMatches = sTitleTokens.filter(t => cTitleTokens.includes(t));
    const titleInDescMatches = sTitleTokens.filter(t => cDescTokens.includes(t));
    const candTitleInSourceDesc = cTitleTokens.filter(t => sDescTokens.includes(t));

    // =========================================================================
    // HIERARCHICAL GATE 1: IDENTITY & KEYWORD PREREQUISITE
    // Two items CANNOT be similar simply by sharing a category or location.
    // There MUST be a title match, keyword overlap, or cross-description reference.
    // =========================================================================
    if (!hasDirectTitleMatch && titleTokenMatches.length === 0 && titleInDescMatches.length === 0 && candTitleInSourceDesc.length === 0) {
        return { score: 0, matchPercentage: 0, reasons: [] };
    }

    let score = 0;
    const reasons = [];

    // Stage 1 Scoring: Title / Identity Foundation
    if (hasDirectTitleMatch) {
        score += 45;
        reasons.push(`Direct title match: "${candidate.title}"`);
    } else if (titleTokenMatches.length > 0) {
        score += Math.min(40, 25 + (titleTokenMatches.length - 1) * 10);
        reasons.push(`Title keywords matched: ${titleTokenMatches.join(", ")}`);
    } else {
        score += 20;
        const crossTokens = [...new Set([...titleInDescMatches, ...candTitleInSourceDesc])];
        reasons.push(`Item keyword found in details: ${crossTokens.slice(0, 2).join(", ")}`);
    }

    // =========================================================================
    // HIERARCHICAL GATE 2: CATEGORY CONSISTENCY
    // If categories conflict, heavily penalize or disqualify.
    // =========================================================================
    if (source.category && candidate.category) {
        const sCat = source.category.toLowerCase().trim();
        const cCat = candidate.category.toLowerCase().trim();
        if (sCat === cCat) {
            score += 25;
            reasons.push(`Confirmed identical category (${candidate.category})`);
        } else if (sCat === "others" || cCat === "others") {
            score += 5;
        } else {
            // Contradictory categories (e.g. "electronics" vs "wallets")
            score -= 30;
            if (score < 20) {
                return { score: 0, matchPercentage: 0, reasons: [] };
            }
        }
    }

    // =========================================================================
    // HIERARCHICAL GATE 3: CONTEXTUAL LOCATION & GPS PROXIMITY
    // Only evaluated once identity and category compatibility are verified.
    // =========================================================================
    if (source.location_name && candidate.location_name) {
        const sLocTokens = getTokens(source.location_name);
        const cLocTokens = getTokens(candidate.location_name);
        const locOverlap = sLocTokens.filter(t => cLocTokens.includes(t));
        if (locOverlap.length > 0) {
            score += 15;
            reasons.push(`Location matched (${candidate.location_name})`);
        }
    }

    if (source.latitude && source.longitude && candidate.latitude && candidate.longitude) {
        const dLat = Math.abs(parseFloat(source.latitude) - parseFloat(candidate.latitude));
        const dLng = Math.abs(parseFloat(source.longitude) - parseFloat(candidate.longitude));
        if (dLat < 0.008 && dLng < 0.008) {
            score += 15;
            reasons.push("Nearby GPS pin (~500m radius)");
        }
    }

    // =========================================================================
    // HIERARCHICAL GATE 4: DISTINGUISHING ATTRIBUTE CORROBORATION
    // Check descriptions for matching specific details (color, brand, scratches).
    // =========================================================================
    const descOverlap = sDescTokens.filter(t => cDescTokens.includes(t) && !titleTokenMatches.includes(t));
    if (descOverlap.length > 0) {
        score += Math.min(15, descOverlap.length * 5);
        reasons.push(`Matching details: ${descOverlap.slice(0, 3).join(", ")}`);
    }

    if (score < 30) {
        return { score: 0, matchPercentage: 0, reasons: [] };
    }

    const matchPercentage = Math.min(98, Math.max(45, Math.round((score / 100) * 100)));
    return { score, matchPercentage, reasons };
}

exports.getItemMatches = async (req, res) => {
    try {
        const item_id = req.params.item_id;
        const [sourceRows] = await pool.query(`
            SELECT i.*, img.image_url, u.name AS owner_name, u.phone AS owner_phone
            FROM items i
            LEFT JOIN item_images img ON i.id = img.item_id
            LEFT JOIN users u ON i.user_id = u.id
            WHERE i.id = ? AND i.is_deleted = FALSE
        `, [item_id]);

        const sourceItem = sourceRows[0];
        if (!sourceItem) {
            return res.status(404).json({ detail: "Item not found" });
        }

        const oppositeType = sourceItem.type.toLowerCase() === 'lost' ? 'found' : 'lost';

        const [candidates] = await pool.query(`
            SELECT i.*, img.image_url, u.name AS owner_name, u.phone AS owner_phone
            FROM items i
            LEFT JOIN item_images img ON i.id = img.item_id
            LEFT JOIN users u ON i.user_id = u.id
            WHERE LOWER(i.type) = LOWER(?)
            AND i.is_deleted = FALSE
            AND i.status = 'active'
            AND i.id != ?
            ORDER BY i.created_at DESC
        `, [oppositeType, item_id]);

        for (let cand of candidates) {
            if (cand.image_url) {
                const filename = path.basename(cand.image_url);
                cand.image_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            }
        }

        const scoredMatches = [];
        for (let cand of candidates) {
            const { score, matchPercentage, reasons } = calculateMatchScore(sourceItem, cand);
            if (score >= 30) {
                scoredMatches.push({
                    ...cand,
                    match_score: score,
                    match_percentage: matchPercentage,
                    match_reasons: reasons
                });
            }
        }

        scoredMatches.sort((a, b) => b.match_score - a.match_score);
        return res.json(scoredMatches.slice(0, 8));
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

exports.getPotentialMatches = async (req, res) => {
    try {
        const { type, category, title, location_name, latitude, longitude } = req.query;
        if (!type) {
            return res.status(400).json({ detail: "Type is required" });
        }

        const oppositeType = type.toLowerCase() === 'lost' ? 'found' : 'lost';
        const sourcePseudo = {
            type,
            category: category || "",
            title: title || "",
            description: "",
            location_name: location_name || "",
            latitude: latitude || null,
            longitude: longitude || null
        };

        const [candidates] = await pool.query(`
            SELECT i.*, img.image_url, u.name AS owner_name, u.phone AS owner_phone
            FROM items i
            LEFT JOIN item_images img ON i.id = img.item_id
            LEFT JOIN users u ON i.user_id = u.id
            WHERE LOWER(i.type) = LOWER(?)
            AND i.is_deleted = FALSE
            AND i.status = 'active'
            ORDER BY i.created_at DESC
        `, [oppositeType]);

        for (let cand of candidates) {
            if (cand.image_url) {
                const filename = path.basename(cand.image_url);
                cand.image_url = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
            }
        }

        const scoredMatches = [];
        for (let cand of candidates) {
            const { score, matchPercentage, reasons } = calculateMatchScore(sourcePseudo, cand);
            if (score >= 30) {
                scoredMatches.push({
                    ...cand,
                    match_score: score,
                    match_percentage: matchPercentage,
                    match_reasons: reasons
                });
            }
        }

        scoredMatches.sort((a, b) => b.match_score - a.match_score);
        return res.json(scoredMatches.slice(0, 6));
    } catch (err) {
        return res.status(500).json({ detail: "Server error", error: err.message });
    }
};

