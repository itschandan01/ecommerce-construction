import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByEmail,
  updateUserPassword,
} from "../models/userModel.js";
import { saveOtp, verifyOtp, deleteOtp } from "../models/otpModel.js";
import {
  sendSignupOtpEmail,
  sendPasswordResetOtpEmail,
} from "./emailController.js";

/**
 * Generates a random 6-digit numeric OTP
 */
const generate6DigitOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @route   POST /api/auth/send-otp
 * @desc    Generates and emails a 6-digit OTP for Signup Verification
 */
export const sendSignupOtp = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email address is required." });
  }

  try {
    // 1. Check if email is already registered
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered. Please log in." });
    }

    // 2. Generate 6-digit OTP & save
    const otp = generate6DigitOtp();
    await saveOtp(email, otp, "signup");

    // 3. Send Email
    await sendSignupOtpEmail({ email, otp, name });

    res.status(200).json({
      message: `A 6-digit verification code has been sent to ${email}`,
    });
  } catch (err) {
    console.error("Send Signup OTP Error:", err);
    res.status(500).json({ error: "Failed to send verification email. Please check email address." });
  }
};

/**
 * @route   POST /api/auth/register
 * @desc    Verifies OTP and registers user
 */
export const register = async (req, res) => {
  const { name, email, password, address, phone_number, otp } = req.body;

  if (!name || !email || !password || !otp) {
    return res
      .status(400)
      .json({ error: "Please enter all required fields including the 6-digit OTP code." });
  }

  try {
    // 1. Verify 6-digit OTP
    const verification = await verifyOtp(email, otp, "signup");
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    // 2. Hash password & Create User
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await createUser(
      name,
      email,
      password_hash,
      address,
      phone_number
    );

    // 3. Delete used OTP
    await deleteOtp(email, "signup");

    // 4. Generate JWT
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET || "YOUR_VERY_STRONG_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists." });
    }

    console.error("Registration error:", err.message);
    res.status(500).json({ error: "Server error during registration." });
  }
};

/**
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || "YOUR_VERY_STRONG_SECRET_KEY",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error during login." });
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Sends 6-digit OTP for Forgot Password
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Please enter your email address." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "No user found with this email address." });
    }

    const otp = generate6DigitOtp();
    await saveOtp(email, otp, "forgot");
    await sendPasswordResetOtpEmail({ email, otp });

    res.json({ message: `Password reset OTP sent to ${email}` });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Failed to send reset email. Please try again." });
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Verifies reset OTP and updates user password
 */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Email, OTP, and new password are required." });
  }

  try {
    const verification = await verifyOtp(email, otp, "forgot");
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await updateUserPassword(email, password_hash);
    await deleteOtp(email, "forgot");

    res.json({ message: "Password reset successful! You can now log in with your new password." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
  }
};
