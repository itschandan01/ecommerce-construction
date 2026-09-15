// import express from "express";
// import {
//   getAllProducts,
//   manageProduct,
//   deleteProduct,
// } from "../controllers/productController.js";
// import { protect } from "../middleware/authMiddleware.js";
// import { isOwner } from "../middleware/ownerAuthMiddleware.js";

// const router = express.Router();

// // Public
// router.get("/", getAllProducts);

// // Admin / Owner
// router.post("/manage", protect, isOwner, manageProduct);
// router.put("/manage/:id", protect, isOwner, manageProduct);
// router.delete("/manage/:id", protect, isOwner, deleteProduct);

// export default router;


// import express from "express";
// import {
//   getAllProducts,
//   manageProduct,
//   deleteProduct,
// } from "../controllers/productController.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import { isOwner } from "../middleware/ownerAuthMiddleware.js";

// const router = express.Router();

// // Public
// router.get("/", getAllProducts);

// // Admin / Owner
// router.post("/manage", authMiddleware, isOwner, manageProduct);
// router.put("/manage/:id", authMiddleware, isOwner, manageProduct);
// router.delete("/manage/:id", authMiddleware, isOwner, deleteProduct);

// export default router;
import express from "express";
import {
  getAllProducts,
  manageProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { isOwner } from "../middleware/ownerAuthMiddleware.js";

const router = express.Router();

// ===============================
// Public Routes
// ===============================
router.get("/", getAllProducts);

// ===============================
// Admin / Owner Routes
// ===============================
router.post("/manage", protect, isOwner, manageProduct);
router.put("/manage/:id", protect, isOwner, manageProduct);
router.delete("/manage/:id", protect, isOwner, deleteProduct);

export default router;
