const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const itemsController = require('../controllers/itemsController');
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ dest: path.join(__dirname, '../uploads/temp') });

router.post('/', authMiddleware, upload.single('image'), itemsController.createItem);
router.get('/', authMiddleware.optionalAuth, itemsController.getItems);
router.get('/my', authMiddleware, itemsController.getMyItems);
router.get('/potential-matches', itemsController.getPotentialMatches);
router.get('/:item_id/matches', itemsController.getItemMatches);
router.get('/:item_id', itemsController.getSingleItem);
router.put('/:item_id/mark-returned', authMiddleware, itemsController.markItemReturned);

module.exports = router;
