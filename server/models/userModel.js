import pool from "../config/db.js";

/**
 * Inserts a new user into the database.
 */
export const createUser = async (
  name,
  email,
  passwordHash,
  address,
  phoneNumber
) => {
  const result = await pool.query(
    `INSERT INTO users 
     (name, email, password_hash, address, phone_number)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [name, email, passwordHash, address, phoneNumber]
  );

  return result.rows[0];
};

/**
 * Finds a user by their email address.
 */
export const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );
  return result.rows[0];
};

/**
 * Finds a user by their ID.
 */
export const findUserById = async (userId) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [userId]
  );
  return result.rows[0];
};
