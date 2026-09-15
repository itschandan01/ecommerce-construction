import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * Create Order (COD or Razorpay)
 * POST /api/orders
 */
router.post("/", protect, placeOrder);

export default router;
