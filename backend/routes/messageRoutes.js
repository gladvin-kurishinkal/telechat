const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const { sendMessage, getMessages, getConversations, markMessagesAsRead } = require('../controllers/messageController');

const router = express.Router();

// Mark messages as read for a specific user ID
router.post('/mark-read/:id', protect, markMessagesAsRead);

// Get active conversations (for sidebar)
router.get('/conversations', protect, getConversations);

// Get messages for a specific user ID
router.get('/:id', protect, getMessages);

// Send a message to a specific user ID (supports multipart form data for image/video)
router.post('/send/:id', protect, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]), sendMessage);

module.exports = router;
