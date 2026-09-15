import { findAllCategories } from "../models/categoryModel.js";

// @route   GET /api/categories
// @desc    Get all categories and subcategories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await findAllCategories();
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err.message);
    res.status(500).json({
      error: "Server error while fetching categories.",
    });
  }
};
