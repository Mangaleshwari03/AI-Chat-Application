import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  deleteGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/user-groups", protectRoute, getUserGroups);
router.get("/messages/:groupId", protectRoute, getGroupMessages);
router.post("/send/:groupId", protectRoute, sendGroupMessage);
router.delete("/:groupId", protectRoute, deleteGroup);

export default router;
