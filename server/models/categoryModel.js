import pool from "../config/db.js";

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Cement & Concrete", parent_id: null },
  { id: 2, name: "Bricks & Blocks", parent_id: null },
  { id: 3, name: "Steel & Reinforcement", parent_id: null },
  { id: 4, name: "Aggregates", parent_id: null },
  { id: 5, name: "Plumbing", parent_id: null },
  { id: 6, name: "Electrical", parent_id: null },
  { id: 7, name: "Finishing Materials", parent_id: null },
  { id: 8, name: "Tools & Equipment", parent_id: null },
];

/**
 * Fetches all categories, with fallback if DB is offline
 */
export const findAllCategories = async () => {
  try {
    const result = await pool.query(
      "SELECT * FROM categories ORDER BY parent_id NULLS FIRST, name ASC"
    );
    if (result.rows.length > 0) return result.rows;
  } catch (err) {
    try {
      const fallbackResult = await pool.query(
        "SELECT * FROM categories ORDER BY name ASC"
      );
      if (fallbackResult.rows.length > 0) return fallbackResult.rows;
    } catch (dbErr) {
      console.warn("DB offline notice (categories):", dbErr.message);
    }
  }

  return DEFAULT_CATEGORIES;
};
