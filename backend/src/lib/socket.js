import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL, "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true,
  },
});

// 🔥 userId -> socketId
const userSocketMap = {};

io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId) {
  return userSocketMap[Number(userId)];
}

io.on("connection", (socket) => {
  const userId = Number(socket.user.id);

  console.log("Socket connected:", socket.user.fullName, userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // Join user's own room for personalized events
  socket.join(`user_${userId}`);

  // 🔥 SEND ONLINE USERS
  io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));

  // --- TYPING EVENTS ---
  socket.on("typing", ({ receiverId, isGroup }) => {
    if (isGroup) {
      socket.to(`group_${receiverId}`).emit("userTyping", { 
        userId, 
        fullName: socket.user.fullName, 
        groupId: receiverId 
      });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { 
          userId, 
          fullName: socket.user.fullName 
        });
      }
    }
  });

  socket.on("stopTyping", ({ receiverId, isGroup }) => {
    if (isGroup) {
      socket.to(`group_${receiverId}`).emit("userStoppedTyping", { userId, groupId: receiverId });
    } else {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { userId });
      }
    }
  });

  // --- ROOM JOINING (For Groups) ---
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.user.fullName} joined group: ${groupId}`);
  });

  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`User ${socket.user.fullName} left group: ${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap).map(Number));
  });

});

export { io, app, server };
