const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const claimsController = require('../controllers/claimsController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: path.join(__dirname, '../uploads/temp') });

router.post('/', authMiddleware, upload.single('proof_image'), claimsController.createClaim);
router.get('/my', authMiddleware, claimsController.getMyClaims);
router.get('/item/:item_id', authMiddleware, claimsController.viewClaimsForItem);
router.put('/:claim_id/approve', authMiddleware, claimsController.approveClaim);
router.put('/:claim_id/reject', authMiddleware, claimsController.rejectClaim);

module.exports = router;
