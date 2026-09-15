// import pool from "../config/db.js";

// export const addAddress = async (req, res) => {
//   const userId = req.user.id;
//   const { full_name, phone, address_line, city, state, pincode } = req.body;

//   try {
//     const result = await pool.query(
//       `INSERT INTO addresses
//        (user_id, full_name, phone, address_line, city, state, pincode)
//        VALUES ($1,$2,$3,$4,$5,$6,$7)
//        RETURNING *`,
//       [userId, full_name, phone, address_line, city, state, pincode]
//     );

//     res.status(201).json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

import pool from "../config/db.js";

/**
 * Add new address
 */
export const addAddress = async (req, res) => {
  const { full_name, phone, address_line, city, state, pincode } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `
      INSERT INTO addresses
      (user_id, full_name, phone, address_line, city, state, pincode)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [userId, full_name, phone, address_line, city, state, pincode]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ error: "Failed to add address" });
  }
};

/**
 * Get all addresses of logged-in user
 */
export const getAddresses = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Fetch address error:", err);
    res.status(500).json({ error: "Failed to fetch addresses" });
  }
};
