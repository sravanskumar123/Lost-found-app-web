const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply both auth and admin middlewares to all routes in this file
router.use(authMiddleware, adminMiddleware);

router.get('/users', adminController.getAllUsers);
router.get('/items', adminController.getAllItems);
router.get('/claims', adminController.getAllClaims);
router.delete('/items/:item_id', adminController.softDeleteItem);
router.put('/items/:item_id/restore', adminController.restoreItem);
router.put('/claims/:claim_id/force-reject', adminController.forceRejectClaim);
router.put('/claims/:claim_id/approve', adminController.adminApproveClaim);
router.get('/dashboard', adminController.adminDashboard);

module.exports = router;
