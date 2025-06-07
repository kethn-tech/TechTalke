const User = require("../models/UserModel");
  const mongoose = require("mongoose");
  const Message = require("../models/MessageModel");
  const searchContact = async (req, res, next) => {
    try {
      const { searchTerm } = req.body;
      const sanitizedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const searchRegex = new RegExp(sanitizedSearchTerm, "i");
      const contacts = await User.find({
        $and: [
          { _id: { $ne: req.id } },
          {
            $or: [
              { firstName: searchRegex },
              { lastName: searchRegex },
              { email: searchRegex },
            ],
          },
        ],
      });
      return res.status(200).json({ contacts });
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  };
  const blockUser = async (req, res) => {
    try {
      const userToBlock = req.params.userId;
      const currentUser = req.id;
      // Validate user IDs
      if (!mongoose.Types.ObjectId.isValid(userToBlock) || !mongoose.Types.ObjectId.isValid(currentUser)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      // Get current user
      const user = await User.findById(currentUser);
      if (!user) {
        return res.status(404).json({ message: "Current user not found" });
      }
      // Check if user exists
      const blockingUser = await User.findById(userToBlock);
      if (!blockingUser) {
        return res.status(404).json({ message: "User to block not found" });
      }
      // Check if user is already blocked
      const isBlocked = user.blockedUsers?.includes(userToBlock);
      // Update blocked users array
      if (isBlocked) {
        // Unblock user
        await User.findByIdAndUpdate(currentUser, {
          $pull: { blockedUsers: userToBlock }
        });
      } else {
        // Block user
        await User.findByIdAndUpdate(currentUser, {
          $addToSet: { blockedUsers: userToBlock }
        });
      }
      return res.status(200).json({
        message: isBlocked ? "User unblocked successfully" : "User blocked successfully"
      });
    } catch (error) {
      console.error("Error in blockUser:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  const getDMList = async (req, res, next) => {
    try {
      let userId = req.id;
      userId = new mongoose.Types.ObjectId(userId);
      const contacts = await Message.aggregate([
        {
          $match: {
            $or: [{ sender: userId }, { recipient: userId }],
          },
        },
        {
          $sort: { timeStamp: -1 },
        },
        {
          $group: {
            _id: {
              $cond: {
                if: { $eq: ["$sender", userId] },
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
            _id: 1,
            lastMessageTime: 1,
            firstName: "$contactInfo.firstName",
            lastName: "$contactInfo.lastName",
            email: "$contactInfo.email",
            image: "$contactInfo.image",
          },
        },
        {
          $sort: { lastMessageTime: -1 },
        },
      ]);
      return res.status(200).json({ contacts });
    } catch (error) {
      return res.status(500).send("Internal Server Error");
    }
  };
  module.exports = {
    searchContact,
    getDMList,
    blockUser
  };
