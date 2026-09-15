import express from "express";
import { getAllOrders, updateOrderStatus } from "../controllers/adminOrderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/ownerAuthMiddleware.js";

const router = express.Router();

router.get("/orders", protect, isOwner, getAllOrders);
router.put("/orders/:id/status", protect, isOwner, updateOrderStatus);

export default router;
