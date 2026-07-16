import express from "express";
import { getAdminStats, toggleBlockUser, deleteUser, deleteGroupAdmin } from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection);
router.use(protectRoute);

// Admin check middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Admin only." });
  }
};

router.use(requireAdmin);

router.get("/stats", getAdminStats);
router.put("/users/:userId/block", toggleBlockUser);
router.delete("/users/:userId", deleteUser);
router.delete("/groups/:groupId", deleteGroupAdmin);

export default router;
