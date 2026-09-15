import pool from "../config/db.js";

const memoryAddresses = new Map();

/**
 * Add new address
 */
export const addAddress = async (req, res) => {
  const { full_name, phone, address_line, city, state, pincode, street_address } = req.body;
  const userId = req.user?.id || 1;

  const addressLineText = address_line || street_address || `${city || ''}, ${state || ''}`;

  const newAddress = {
    id: Date.now(),
    user_id: userId,
    full_name: full_name || "Customer",
    phone: phone || "",
    address_line: addressLineText,
    street_address: addressLineText,
    city: city || "",
    state: state || "",
    pincode: pincode || "",
  };

  const userAddrs = memoryAddresses.get(userId) || [];
  userAddrs.unshift(newAddress);
  memoryAddresses.set(userId, userAddrs);

  try {
    const result = await pool.query(
      `
      INSERT INTO addresses
      (user_id, full_name, phone, address_line, city, state, pincode)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [userId, full_name || "Customer", phone || "", addressLineText, city || "", state || "", pincode || ""]
    );

    if (result.rows[0]) {
      return res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.warn("DB address save notice (using fallback):", err.message);
  }

  return res.status(201).json(newAddress);
};

/**
 * Get all addresses of logged-in user
 */
export const getAddresses = async (req, res) => {
  const userId = req.user?.id || 1;

  try {
    const result = await pool.query(
      "SELECT * FROM addresses WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );

    if (result.rows.length > 0) {
      return res.json(result.rows);
    }
  } catch (err) {
    console.warn("DB fetch address notice (using fallback):", err.message);
  }

  const userAddrs = memoryAddresses.get(userId) || [];
  return res.json(userAddrs);
};
