const Message = require('../models/MessageModel');

const getMessages = async (req, res, next) => {
    try{
        const user1 = req.id;
        const user2 = req.body.id;

        if(!user1 || !user2){
            return res.status(400).json({
                Error: "Invalid request"
            });
        }

        const chat = await Message.find({
            $or: [
                { sender: user1, recipient: user2 },
                { sender: user2, recipient: user1 }
            ]
        })
        .populate("sender", "_id firstName lastName email image")
        .populate("recipient", "_id firstName lastName email image")
        .sort({ timeStamp: 1 });

        return res.status(200).json({ chat });
    }

    catch(err){
        console.error("Error fetching messages:", err);
        return res.status(500).json({
            Error: "Internal Server Error"
        });
    }
};

const searchMessages = async (req, res) => {
    try {
        const { chatId, query } = req.body;
        const userId = req.id;

        if (!chatId || !query) {
            return res.status(400).json({
                error: "Missing required parameters"
            });
        }

        const messages = await Message.find({
            $and: [
                {
                    $or: [
                        { sender: userId, recipient: chatId },
                        { sender: chatId, recipient: userId }
                    ]
                },
                {
                    $or: [
                        { content: { $regex: query, $options: 'i' } },
                        { messageType: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        })
        .populate("sender", "_id firstName lastName email image")
        .populate("recipient", "_id firstName lastName email image")
        .sort({ timeStamp: -1 });

        return res.status(200).json({ messages });
    } catch (error) {
        console.error('Error searching messages:', error);
        return res.status(500).json({
            error: "Internal Server Error"
        });
    }
};

module.exports = {
    getMessages,
    searchMessages
};