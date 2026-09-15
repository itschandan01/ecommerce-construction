import pool from "../config/db.js";

// In-memory store for high-performance OTP validation with DB table fallback
const otpStore = new Map();

/**
 * Saves a 6-digit OTP for a given email and purpose ('signup' or 'forgot')
 * Expires in 10 minutes (600,000 ms)
 */
export const saveOtp = async (email, otp, purpose = "signup") => {
  const normalizedEmail = email.toLowerCase().trim();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  // 1. Save to in-memory store
  otpStore.set(`${normalizedEmail}:${purpose}`, {
    otp: String(otp),
    expiresAt,
  });

  // 2. Best-effort DB persistence (if table exists)
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS email_otps (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose VARCHAR(50) DEFAULT 'signup',
        expires_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    // Delete existing OTPs for this email and purpose
    await pool.query(
      "DELETE FROM email_otps WHERE email = $1 AND purpose = $2",
      [normalizedEmail, purpose]
    );

    // Insert new OTP
    await pool.query(
      "INSERT INTO email_otps (email, otp, purpose, expires_at) VALUES ($1, $2, $3, $4)",
      [normalizedEmail, String(otp), purpose, expiresAt]
    );
  } catch (err) {
    console.warn("DB OTP Save notice:", err.message);
  }
};

/**
 * Verifies a 6-digit OTP for an email and purpose
 */
export const verifyOtp = async (email, inputOtp, purpose = "signup") => {
  const normalizedEmail = email.toLowerCase().trim();
  const cleanInputOtp = String(inputOtp).trim();
  const key = `${normalizedEmail}:${purpose}`;

  // 1. Check in-memory store
  const stored = otpStore.get(key);
  if (stored) {
    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return { valid: false, message: "OTP code has expired. Please request a new code." };
    }
    if (stored.otp === cleanInputOtp) {
      return { valid: true };
    }
  }

  // 2. Check DB fallback
  try {
    const result = await pool.query(
      "SELECT * FROM email_otps WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1",
      [normalizedEmail, purpose]
    );

    if (result.rows.length > 0) {
      const record = result.rows[0];
      if (Date.now() > Number(record.expires_at)) {
        return { valid: false, message: "OTP code has expired. Please request a new code." };
      }
      if (record.otp === cleanInputOtp) {
        return { valid: true };
      }
    }
  } catch (err) {
    console.warn("DB OTP Verify notice:", err.message);
  }

  return { valid: false, message: "Invalid 6-digit OTP code. Please check your email." };
};

/**
 * Removes used OTP
 */
export const deleteOtp = async (email, purpose = "signup") => {
  const normalizedEmail = email.toLowerCase().trim();
  otpStore.delete(`${normalizedEmail}:${purpose}`);
  try {
    await pool.query("DELETE FROM email_otps WHERE email = $1 AND purpose = $2", [
      normalizedEmail,
      purpose,
    ]);
  } catch (err) {
    // Ignore cleanup error
  }
};
