import express from "express";
import { getAllCategories } from "../controllers/categoryController.js";

const router = express.Router();

// Public route: Fetch all categories
router.get("/", getAllCategories);

export default router;
