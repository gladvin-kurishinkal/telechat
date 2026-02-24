const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @route   POST /api/messages/send/:id
// @desc    Send a message (text, image, video) to user ID
exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Check for uploaded files
        const image = req.files?.image ? `/uploads/${req.files.image[0].filename}` : '';
        const video = req.files?.video ? `/uploads/${req.files.video[0].filename}` : '';

        if (!text && !image && !video) {
            return res.status(400).json({ message: 'Cannot send an empty message' });
        }

        // Find or create conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
            });
        }

        // Create the message
        const newMessage = await Message.create({
            conversationId: conversation._id,
            senderId,
            text: text || '',
            image,
            video,
        });

        // Update conversation's last message
        conversation.lastMessage = newMessage._id;
        await conversation.save();

        res.status(201).json(newMessage);

        // TODO: Emit socket event here
        const { getReceiverSocketId, io } = require('../socket/socket');
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', newMessage);
        }

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/messages/:id
// @desc    Get all messages between current user and target user ID
exports.getMessages = async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const currentUserId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, targetUserId] },
        });

        if (!conversation) return res.status(200).json([]);

        const messages = await Message.find({ conversationId: conversation._id })
            .sort({ createdAt: 1 }); // Oldest first

        // Mark messages as read since the user is opening the conversation
        const result = await Message.updateMany(
            { conversationId: conversation._id, senderId: targetUserId, read: false },
            { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
            const { getReceiverSocketId, io } = require('../socket/socket');
            const receiverSocketId = getReceiverSocketId(targetUserId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('messagesRead', { conversationId: conversation._id });
            }
        }

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   POST /api/messages/mark-read/:id
// @desc    Mark all messages in a conversation as read by target user ID
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const currentUserId = req.user._id;

        const conversation = await Conversation.findOne({
            participants: { $all: [currentUserId, targetUserId] },
        });

        if (!conversation) return res.status(200).json({ message: 'Conversation not found' });

        const result = await Message.updateMany(
            { conversationId: conversation._id, senderId: targetUserId, read: false },
            { $set: { read: true } }
        );

        if (result.modifiedCount > 0) {
            const { getReceiverSocketId, io } = require('../socket/socket');
            const receiverSocketId = getReceiverSocketId(targetUserId);
            if (receiverSocketId) {
                // Tell the person who sent the messages that we've read them
                io.to(receiverSocketId).emit('messagesRead', { conversationId: conversation._id });
            }
        }

        res.status(200).json({ status: 'ok', modifiedCount: result.modifiedCount });
    } catch (error) {
        console.error('Error marking messages as read:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @route   GET /api/messages/conversations/all
// @desc    Get all active conversations for the sidebar
exports.getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const conversations = await Conversation.find({
            participants: { $in: [currentUserId] }
        })
            .populate('participants', 'username email profilePic')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // Format for frontend (filter out self from participants)
        const activeConversations = conversations.filter(conv =>
            conv.participants.some(p => p._id.toString() !== currentUserId.toString())
        );

        const formattedConversations = await Promise.all(activeConversations.map(async conv => {
            const partner = conv.participants.find(p => p._id.toString() !== currentUserId.toString());

            const unreadCount = await Message.countDocuments({
                conversationId: conv._id,
                read: false,
                senderId: partner._id
            });

            return {
                _id: conv._id, // Conversation ID
                partner,
                lastMessage: conv.lastMessage,
                unreadCount
            };
        }));

        res.status(200).json(formattedConversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
