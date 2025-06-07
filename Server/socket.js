const {Server} = require('socket.io');
const Message = require('./models/MessageModel');
const mongoose = require("mongoose");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      // Update CORS configuration to include localhost:5174
      origin: [
        "https://techtalke.vercel.app", // Add your Vercel frontend
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    },
  });

  const userSocketMap = new Map();

  const getDMList = async (userId) => {
    try {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      const contacts = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: userObjectId }, { recipient: userObjectId }],
          },
        },
        {
          $sort: { timeStamp: -1 },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender", userObjectId] },
                then: "$recipient",
                else: "$sender",
              },
            },
            lastMessageTime: { $first: "$timeStamp" },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            as: "contactInfo",
          },
        },
        {
          $unwind: "$contactInfo",
        },
        {
          $project: {
            _id: "$contactInfo._id",
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            email: "$contactInfo.email",
            image: "$contactInfo.image",
            lastMessageTime: 1,
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ]);
      return contacts;
    } catch (error) {
      console.error("Error getting DM list:", error);
      return [];
    }
  };

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createdMessage = await Message.create(message);

      // Fix the population fields
      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "_id firstName lastName email image")
        .populate("recipient", "_id firstName lastName email image");

      // Get updated DM lists for both sender and recipient
      const senderDMList = await getDMList(message.sender);
      const recipientDMList = await getDMList(message.recipient);

      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
        io.to(senderSocketId).emit("dmListUpdate", senderDMList);
      }

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
        io.to(recipientSocketId).emit("dmListUpdate", recipientDMList);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const deleteMessage = async (data) => {
    try {
      const { messageId, sender, recipient } = data;
      await Message.findByIdAndDelete(messageId);

      const senderSocketId = userSocketMap.get(sender);
      const recipientSocketId = userSocketMap.get(recipient);

      if (senderSocketId) {
        io.to(senderSocketId).emit("messageDeleted", { messageId });
      }

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("messageDeleted", { messageId });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  // Broadcast online status to all clients
  const broadcastOnlineStatus = () => {
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("onlineUsers", onlineUsers);
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket id: ${socket.id}`);

      // Emit the updated online users list
      broadcastOnlineStatus();
    } else {
      console.log("User connected without userId");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("deleteMessage", deleteMessage);

    socket.on("disconnect", () => {
      userSocketMap.delete(userId);
      console.log(`User disconnected: ${userId}`);
      // Emit the updated online users list
      broadcastOnlineStatus();
    });
  });
};

module.exports = setupSocket;