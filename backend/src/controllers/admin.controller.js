import User from "../models/User.js";
import Message from "../models/Message.js";
import Group from "../models/Group.js";
import { Op } from "sequelize";
import { sequelize } from "../lib/db.js";

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMessages = await Message.count();
    const totalGroups = await Group.count();

    // 1. Role Distribution (Admins vs Users)
    const roleStats = await User.findAll({
      attributes: ['role', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['role']
    });

    // 2. Message Activity (Last 7 Days)
    const messageStats = await Message.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    // 3. User List
    const users = await User.findAll({
      where: { role: 'user' }, // Only show regular users, don't show admins
      attributes: ['id', 'fullName', 'email', 'profilePic', 'isBlocked', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // 4. Group List
    const groups = await Group.findAll({
      include: [{ model: User, attributes: ['id', 'fullName'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      stats: {
        totalUsers,
        totalMessages,
        totalGroups,
        roleDistribution: roleStats,
        messageActivity: messageStats,
      },
      users,
      groups
    });
  } catch (error) {
    console.error("Error in getAdminStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot block an admin" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
      user: {
        id: user.id,
        fullName: user.fullName,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error("Error toggling block:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: "Cannot delete an admin" });
    }

    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteGroupAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await group.destroy();
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
