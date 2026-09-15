// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { createPayment, verifyPayment } from "../controllers/paymentController.js";

// const router = express.Router();

// router.post("/create", authMiddleware, createPayment);
// router.post("/verify", authMiddleware, verifyPayment);

// export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPayment,
  verifyPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

/**
 * Razorpay payment routes
 * Base path: /api/payment
 */

// Create Razorpay order
router.post("/create", protect, createPayment);

// Verify Razorpay payment
router.post("/verify", protect, verifyPayment);

export default router;
