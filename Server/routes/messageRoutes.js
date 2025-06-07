const router = require('express').Router();
const { getMessages, searchMessages } = require('../controllers/messageController');
const verifyToken = require('../middlewares/AuthMiddleware');

router.post('/get-messages', verifyToken, getMessages);
router.post('/search', verifyToken, searchMessages);

module.exports = router;