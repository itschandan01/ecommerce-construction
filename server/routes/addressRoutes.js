// import express from "express";
// import { addAddress } from "../controllers/addressController.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.post("/", authMiddleware, addAddress);

// export default router;

// import express from "express";
// import { protect } from "../middleware/authMiddleware.js";
// import {
//   addAddress,
//   getUserAddresses,
// } from "../controllers/addressController.js";

// const router = express.Router();

// /**
//  * Address Routes
//  * Base path: /api/addresses
//  */

// // Add new address
// router.post("/", protect, addAddress);

// // Get logged-in user's addresses
// router.get("/", protect, getUserAddresses);

// export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addAddress,
  getAddresses,
} from "../controllers/addressController.js";

const router = express.Router();

/**
 * Base: /api/addresses
 */

// Add address
router.post("/", protect, addAddress);

// Get user's addresses
router.get("/", protect, getAddresses);

export default router;
