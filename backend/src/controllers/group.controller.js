import Group from "../models/Group.js";
import GroupMember from "../models/GroupMember.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import Document from "../models/Document.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";
import { extractTextFromPDF } from "../lib/pdfExtractor.js";
import { extractTextFromDOCX } from "../lib/docxExtractor.js";
import { model as aiModel } from "../lib/gemini.js";
import axios from "axios";

export const createGroup = async (req, res) => {
  try {
    const { name, members, description, groupPic, isStudyCircle } = req.body;
    const adminId = req.user.id;

    if (!name || !members || members.length === 0) {
      return res.status(400).json({ message: "Name and members are required" });
    }

    let groupPicUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic, {
        folder: "groups",
      });
      groupPicUrl = uploadResponse.secure_url;
    }

    const group = await Group.create({
      name,
      description,
      adminId,
      groupPic: groupPicUrl,
      isStudyCircle: !!isStudyCircle,
    });

    // Add admin as a member
    await GroupMember.create({
      groupId: group.id,
      userId: adminId,
      role: "admin",
    });

    // Add other members
    const memberRecords = members.map((userId) => ({
      groupId: group.id,
      userId: Number(userId),
    }));
    await GroupMember.bulkCreate(memberRecords);

    // Notify all members via socket if online
    const allMemberIds = [adminId, ...members];
    allMemberIds.forEach((id) => {
      const socketId = getReceiverSocketId(id);
      if (socketId) {
        io.to(socketId).emit("newGroup", group);
      }
    });

    res.status(201).json(group);
  } catch (error) {
    console.error("Error in createGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          through: { attributes: [] }, // many-to-many
        },
      ],
    });

    res.status(200).json(user.Groups || []);
  } catch (error) {
    console.error("Error in getUserGroups:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await Message.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "profilePic"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getGroupMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image, fileData, fileName } = req.body;
    const { groupId } = req.params;
    const senderId = req.user.id;

    const group = await Group.findByPk(groupId, {
      include: [{ model: User }],
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let imageUrl = null;
    let fileUrl = null;
    let fileType = null;
    let extractedText = null;

    const uploadPayload = fileData || image;
    if (uploadPayload) {
      // Determine resource_type
      const isDocUpload = fileName && (fileName.toLowerCase().endsWith(".pdf") || fileName.toLowerCase().endsWith(".txt") || fileName.toLowerCase().endsWith(".docx"));
      
      const uploadOptions = {
        folder: "chatify_files",
      };

      if (isDocUpload) {
         uploadOptions.resource_type = "raw";
         const docExt = fileName.toLowerCase().endsWith(".pdf") ? ".pdf" : fileName.toLowerCase().endsWith(".txt") ? ".txt" : ".docx";
         uploadOptions.public_id = fileName.split('.').slice(0, -1).join('.') + "_" + Date.now() + docExt;
      } else {
         uploadOptions.resource_type = "auto";
      }

      const uploadResponse = await cloudinary.uploader.upload(uploadPayload, uploadOptions);
      fileUrl = uploadResponse.secure_url;
      fileType = uploadResponse.resource_type;
      if (fileType === "image") imageUrl = fileUrl;

      const isPDF = fileUrl.toLowerCase().endsWith(".pdf") || (fileName && fileName.toLowerCase().endsWith(".pdf"));
      const isTxt = fileUrl.toLowerCase().endsWith(".txt") || (fileName && fileName.toLowerCase().endsWith(".txt"));
      const isDocx = fileUrl.toLowerCase().endsWith(".docx") || (fileName && fileName.toLowerCase().endsWith(".docx"));

      // ---- EDGE CASE 1: FILE SIZE & TOKEN PROTECTION ----
      if (group.isStudyCircle && (isPDF || isTxt || isDocx)) {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        if (uploadResponse.bytes > MAX_FILE_SIZE) {
          console.warn("File too large for AI extraction:", fileName);
        } else {
          try {
            if (isPDF) {
              extractedText = await extractTextFromPDF(fileUrl);
              console.log("PDF Extraction successful? Length:", extractedText?.length);
            } else if (isTxt) {
              const response = await axios.get(fileUrl, { responseType: "text" });
              extractedText = response.data;
            } else if (isDocx) {
              extractedText = await extractTextFromDOCX(fileUrl);
              console.log("DOCX Extraction successful? Length:", extractedText?.length);
            }

            if (extractedText) {
              await Document.create({
                groupId,
                userId: senderId,
                fileName: fileName || "document",
                fileUrl,
                extractedText,
              });
            }
          } catch (extractionError) {
            console.error("Error extracting text from file:", fileName, extractionError);
          }
        }
      }
    }

    const newMessage = await Message.create({
      senderId,
      groupId,
      text,
      image: imageUrl,
      fileUrl,
      fileType,
    });

    const messageWithSender = await Message.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "profilePic"],
        },
      ],
    });

    // Broadcast to all group members except sender
    group.Users.forEach((user) => {
      if (user.id === senderId) return; // Don't send back to sender
      const socketId = getReceiverSocketId(user.id);
      if (socketId) {
        io.to(socketId).emit("newGroupMessage", messageWithSender);
      }
    });

    // ---- AI ASSISTANT LOGIC FOR SMART STUDY CIRCLE ----
    if (group.isStudyCircle && text) {
      const lowerText = text.toLowerCase();
      const AI_KEYWORDS = ["ai", "summarize", "summary", "summarise", "analyze", "analyse", "mcq", "explain", "what", "how", "tell", "study", "help", "notes", "questions"];
      const isAIAction = AI_KEYWORDS.some(k => lowerText.includes(k));

      if (isAIAction) {
        // Run AI logic asynchronously so it doesn't block the actual message from sending
        (async () => {
          try {
            const allDocs = await Document.findAll({ where: { groupId } });
            const contextText = allDocs.length > 0 
              ? allDocs.map(d => d.extractedText).join("\n\n").substring(0, 30000)
              : "No documents have been uploaded to this study group yet.";

            let prompt = `You are Meta AI. [Today's Date: ${new Date().toLocaleDateString('en-GB')}]
            Context from uploaded documents:
            ${contextText.substring(0, 20000)}
            
            User Message: ${text}
            
            Strict Instructions:
            1. Prioritize the provided document context above for all answers.
            2. If you find the answer in the documents, start with "Based on the documents:".
            3. If the answer is NOT in the documents, use your general knowledge to explain but clearly state "This information is not explicitly in your documents, but here is a general explanation:".
            4. If the user asks for a "summary", provide a clear, bulleted summary of the documents.
            5. If the user asks for "MCQs", generate 5 multiple choice questions with options and an answer key at the bottom.
            6. Keep the tone academic, helpful, and concise. Use Markdown formatting for headings and lists.`;

            const result = await aiModel.generateContent(prompt);
            
            const aiResponseText = result.response.text() || "I was unable to generate a response for this request.";

            const aiMessage = await Message.create({
              senderId: null, 
              groupId,
              text: aiResponseText,
            });

            console.log("✅ AI Response Generated. Length:", aiResponseText.length);

            const aiMessageWithSender = {
              ...aiMessage.toJSON(),
              sender: { id: 0, fullName: "Meta AI", profilePic: "/ai_avatar.png" }
            };

            group.Users.forEach((user) => {
              const socketId = getReceiverSocketId(user.id);
              if (socketId) io.to(socketId).emit("newGroupMessage", aiMessageWithSender);
            });
          } catch (aiError) {
            console.error("CRITICAL AI ERROR DETAILS:", {
              message: aiError.message,
              stack: aiError.stack,
              response: aiError.response?.data || aiError.response
            });
            
            const errorMessage = await Message.create({
              senderId: null,
              groupId,
              text: "⚠️ Sorry, I encountered an error while processing your request. Please try again or check the file size.",
            });

            group.Users.forEach((user) => {
              const socketId = getReceiverSocketId(user.id);
              if (socketId) {
                io.to(socketId).emit("newGroupMessage", {
                  ...errorMessage.toJSON(),
                  sender: { id: 0, fullName: "Meta AI", profilePic: "/ai_avatar.png" }
                });
              }
            });
          }
        })();
      }
    }

    res.status(201).json(messageWithSender);
  } catch (error) {
    console.error("Error in sendGroupMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findByPk(groupId, {
      include: [{ model: User }],
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.adminId !== userId) {
      return res.status(403).json({ message: "Only group admin can delete the group" });
    }

    // Notify members before deletion
    group.Users.forEach((user) => {
      const socketId = getReceiverSocketId(user.id);
      if (socketId) {
        io.to(socketId).emit("groupDeleted", { groupId: Number(groupId) });
      }
    });

    // Delete associated Documents from DB (Cloudinary files stay for now to be safe, or we could delete them too)
    await Document.destroy({ where: { groupId } });
    // Delete messages
    await Message.destroy({ where: { groupId } });
    // Delete members
    await GroupMember.destroy({ where: { groupId } });
    // Delete the group itself
    await group.destroy();

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error in deleteGroup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
