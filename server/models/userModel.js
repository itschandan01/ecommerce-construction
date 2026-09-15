import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const memoryUsers = new Map();

// Admin account configuration (Loaded strictly from environment variables)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "adityaenterprisesofficial62@gmail.com").toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  memoryUsers.set(ADMIN_EMAIL, {
    id: 1,
    name: "Aditya Enterprises",
    email: ADMIN_EMAIL,
    password_hash: adminPasswordHash,
    address: "Aditya Enterprises HQ",
    phone_number: "6203829149",
    role: "admin",
  });
}

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
  const normalizedEmail = email.toLowerCase().trim();
  const userData = {
    id: memoryUsers.size + 1,
    name,
    email: normalizedEmail,
    password_hash: passwordHash,
    address,
    phone_number: phoneNumber,
  };
  memoryUsers.set(normalizedEmail, userData);

  try {
    const result = await pool.query(
      `INSERT INTO users 
       (name, email, password_hash, address, phone_number)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email`,
      [name, normalizedEmail, passwordHash, address, phoneNumber]
    );
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (createUser):", err.message);
  }

  return userData;
};

/**
 * Finds a user by their email address.
 */
export const findUserByEmail = async (email) => {
  if (!email) return null;
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = $1",
      [normalizedEmail]
    );
    if (result.rows.length > 0) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (findUserByEmail):", err.message);
  }

  return memoryUsers.get(normalizedEmail) || null;
};

/**
 * Finds a user by their ID.
 */
export const findUserById = async (userId) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length > 0) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (findUserById):", err.message);
  }

  for (const user of memoryUsers.values()) {
    if (user.id === Number(userId)) return user;
  }
  return null;
};

/**
 * Updates a user's password hash.
 */
export const updateUserPassword = async (email, passwordHash) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = memoryUsers.get(normalizedEmail);
  if (user) {
    user.password_hash = passwordHash;
  }

  try {
    const result = await pool.query(
      "UPDATE users SET password_hash = $1 WHERE LOWER(email) = $2 RETURNING id, name, email",
      [passwordHash, normalizedEmail]
    );
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (updateUserPassword):", err.message);
  }

  return user || null;
};
