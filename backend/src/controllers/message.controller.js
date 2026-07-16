import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import { Op } from "sequelize";

/* =========================
   GET ALL CONTACTS
========================= */
export const getAllContacts = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: "contacts",
          through: { attributes: [] },
          attributes: ["id", "fullName", "email", "profilePic"],
        },
      ],
    });

    res.status(200).json(user.contacts || []);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addContact = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const contactUser = await User.findOne({ where: { email } });
    if (!contactUser) {
      return res.status(404).json({ message: "User with this email not found" });
    }

    if (contactUser.id === userId) {
      return res.status(400).json({ message: "You cannot add yourself as a contact" });
    }

    // Check if already a contact
    const existingContact = await Contact.findOne({
      where: { userId, contactId: contactUser.id },
    });

    if (existingContact) {
      return res.status(400).json({ message: "User is already in your contacts" });
    }

    await Contact.create({ userId, contactId: contactUser.id });
    
    // Also add the current user to the other person's contact list (Bidirectional)
    await Contact.findOrCreate({
      where: { userId: contactUser.id, contactId: userId }
    });

    res.status(200).json({
      message: "Contact added successfully",
      contact: {
        id: contactUser.id,
        fullName: contactUser.fullName,
        email: contactUser.email,
        profilePic: contactUser.profilePic,
      },
    });
  } catch (error) {
    console.log("Error in addContact:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET MESSAGES
========================= */
export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const userToChatId = Number(req.params.id);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: myId, receiverId: userToChatId },
          { senderId: userToChatId, receiverId: myId },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   SEND MESSAGE
========================= */
export const sendMessage = async (req, res) => {
  try {
    const { text, image, fileData } = req.body;
    const senderId = Number(req.user.id);
    const receiverId = Number(req.params.id); // 🔥 MAIN FIX

    if (!text && !image && !fileData) {
      return res.status(400).json({ message: "Text, image, or file is required." });
    }

    if (senderId === receiverId) {
      return res
        .status(400)
        .json({ message: "Cannot send message to yourself." });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl = null;
    let fileUrl = null;
    let fileType = null;

    const uploadPayload = fileData || image;
    if (uploadPayload) {
      const uploadResponse = await cloudinary.uploader.upload(uploadPayload, {
        resource_type: "auto",
      });
      fileUrl = uploadResponse.secure_url;
      fileType = uploadResponse.resource_type; // 'image', 'video', 'raw'

      // Keep imageUrl backward compatible
      if (fileType === "image") {
        imageUrl = fileUrl;
      }
    }

    // --- AVATAR NLP MAPPING LOGIC ---
    let action = "idle";
    let emotion = "neutral";
    const lowerText = text ? text.toLowerCase() : "";

    if (lowerText.match(/\b(hi|hello|hey|greetings|morning)\b/)) {
      action = "wave";
      emotion = "happy";
    } else if (lowerText.match(/\b(haha|lol|lmao|funny|great|awesome)\b/)) {
      action = "laugh";
      emotion = "joy";
    } else if (lowerText.match(/\b(bye|goodnight|see ya|cya|later)\b/)) {
      action = "nod";
      emotion = "calm";
    } else if (lowerText.match(/\b(angry|mad|terrible|hate|frustrating)\b/)) {
      action = "shake_head";
      emotion = "angry";
    } else if (lowerText.match(/\b(sad|depressed|sorry|apologies)\b/)) {
      action = "look_down";
      emotion = "sad";
    } else if (lowerText.match(/\b(congrats|wow|omg|amazing|woah)\b/)) {
      action = "jump";
      emotion = "surprised";
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      fileUrl,
      fileType,
      action,
      emotion,
    });

    // 🔥 SOCKET REAL-TIME SEND
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        ...newMessage.toJSON(),
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   GET CHAT PARTNERS
========================= */
export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = Number(req.user.id);

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: loggedInUserId },
          { receiverId: loggedInUserId },
        ],
      },
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId === loggedInUserId ? msg.receiverId : msg.senderId
        )
      ),
    ];

    const chatPartners = await User.findAll({
      where: {
        id: {
          [Op.in]: chatPartnerIds,
        },
      },
      attributes: { exclude: ["password"] },
    });

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   MARK MESSAGES AS SEEN
========================= */
export const markMessagesAsSeen = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const senderId = Number(req.params.id);

    await Message.update(
      { isSeen: true },
      {
        where: {
          senderId: senderId,
          receiverId: myId,
          isSeen: false,
        },
      }
    );

    // Notify the sender that their messages were seen
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        seenBy: myId,
        senderId: senderId,
      });
    }

    res.status(200).json({ message: "Messages marked as seen" });
  } catch (error) {
    console.error("Error in markMessagesAsSeen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   DELETE MESSAGE
========================= */
export const deleteMessage = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const messageId = Number(req.params.messageId);

    const message = await Message.findByPk(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only the sender can delete their own message
    if (message.senderId !== myId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    const { receiverId, groupId } = message;
    await message.destroy();

    // Real-time: notify both parties
    if (groupId) {
      io.to(`group_${groupId}`).emit("messageDeleted", { messageId, groupId });
    } else if (receiverId) {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", { messageId });
      const senderSocketId = getReceiverSocketId(myId);
      if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    console.error("Error in deleteMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/* =========================
   CLEAR ALL MESSAGES IN CHAT
========================= */
export const clearChat = async (req, res) => {
  try {
    const myId = Number(req.user.id);
    const { id: otherIdOrGroupId } = req.params;
    const { isGroup } = req.query; // Send as ?isGroup=true

    if (isGroup === "true") {
      // Clear Group Chat
      const groupId = Number(otherIdOrGroupId);
      await Message.destroy({ where: { groupId } });
      
      // Notify all group members
      io.to(`group_${groupId}`).emit("chatCleared", { groupId });
    } else {
      // Clear DM Chat
      const otherId = Number(otherIdOrGroupId);
      await Message.destroy({
        where: {
          [Op.or]: [
            { senderId: myId, receiverId: otherId },
            { senderId: otherId, receiverId: myId },
          ],
        },
      });

      // Notify other user
      const receiverSocketId = getReceiverSocketId(otherId);
      if (receiverSocketId) io.to(receiverSocketId).emit("chatCleared", { senderId: otherId });
      // Notify self (other tabs)
      const myRefSocketId = getReceiverSocketId(myId);
      if (myRefSocketId) io.to(myRefSocketId).emit("chatCleared", { senderId: otherId });
    }

    res.status(200).json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Error in clearChat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
