// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { createOrder, getOrderById } from "../controllers/orderController.js";

// const router = express.Router();

// router.post("/", authMiddleware, createOrder);
// router.get("/:id", authMiddleware, getOrderById);

// export default router;

// server/routes/orderRoutes.js
// import express from "express";
// import { placeOrder } from "../controllers/orderController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /**
//  * Place Order (COD or Razorpay initial order)
//  * POST /api/orders/place
//  */
// router.post("/place", protect, placeOrder);

// export default router;

import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * POST /api/orders/place
 */
router.post("/place", protect, placeOrder);

export default router;
