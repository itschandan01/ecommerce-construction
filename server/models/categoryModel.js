import pool from "../config/db.js";

/**
 * Fetches all categories, including main and subcategories.
 */
export const findAllCategories = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name ASC"
    );
    return result.rows;
  } catch (err) {
    // Fallback if parent_id column does not exist in schema
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY name ASC"
    );
    return result.rows;
  }
};

