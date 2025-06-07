const User = require('../models/UserModel');
const Message = require('../models/MessageModel');

// Admin Dashboard Stats
exports.getDashboardStats = async (req, res) => {
    try {
        console.log('Admin dashboard stats requested by:', req.user);
        
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        console.log('Admin user found:', adminUser ? adminUser._id : 'Not found');
        console.log('Admin user role:', adminUser ? adminUser.role : 'N/A');
        
        if (!adminUser) {
            console.log('User not found in database');
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }
        
        if (adminUser.role !== 'admin') {
            console.log('User is not an admin, role:', adminUser.role);
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        // Get counts for dashboard
        const totalUsers = await User.countDocuments();
        const totalMessages = await Message.countDocuments();
        
        // Get recent users
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName email image role createdAt');

        // Get user stats by role
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        console.log('Dashboard stats generated successfully');
        
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalMessages,
                recentUsers,
                usersByRole
            }
        });
    } catch (error) {
        console.error('Error getting admin stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard statistics',
            error: error.message
        });
    }
};

// User Management
exports.getAllUsers = async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { page = 1, limit = 10, search = '' } = req.query;
        const skip = (page - 1) * limit;

        // Create search filter if search parameter exists
        const searchFilter = search ? {
            $or: [
                { email: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(searchFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select('-password');

        const totalUsers = await User.countDocuments(searchFilter);

        res.status(200).json({
            success: true,
            users,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving users'
        });
    }
};

exports.updateUserRole = async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId, role } = req.body;

        // Validate role
        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role specified'
            });
        }

        // Prevent self-demotion
        if (userId === req.user.id && role !== 'admin') {
            return res.status(400).json({
                success: false,
                message: 'You cannot demote yourself from admin role'
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: updatedUser
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user role'
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { userId } = req.params;

        // Prevent self-deletion
        if (userId === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own admin account'
            });
        }

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // TODO: Clean up user data (messages, group memberships, etc.)

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
};

// Message Management
exports.getRecentMessages = async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('sender', 'firstName lastName email image')
            .populate('recipient', 'firstName lastName email image name');

        const totalMessages = await Message.countDocuments();

        res.status(200).json({
            success: true,
            messages,
            pagination: {
                total: totalMessages,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(totalMessages / limit)
            }
        });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving messages'
        });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        // Verify admin role
        const adminUser = await User.findById(req.user.id);
        if (
          !adminUser ||
          (adminUser.role !== "admin" && adminUser.role !== "user")
        ) {
          return res.status(403).json({
            success: false,
            message: "Access denied. Admin or moderator privileges required.",
          });
        }

        const { messageId } = req.params;

        const deletedMessage = await Message.findByIdAndDelete(messageId);

        if (!deletedMessage) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting message'
        });
    }
};