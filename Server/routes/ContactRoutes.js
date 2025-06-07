const { Router } = require('express');
const { searchContact, getDMList, blockUser } = require('../controllers/ContactController.js');
const verifyToken = require('../middlewares/AuthMiddleware.js');

const router = Router();
router.post('/search', verifyToken, searchContact);
router.get('/get-dm-list', verifyToken, getDMList);
router.post('/block-user/:userId', verifyToken, blockUser);

module.exports = router;