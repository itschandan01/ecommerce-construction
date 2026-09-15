import express from "express";
import {
  sendSignupOtp,
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Route to request signup verification OTP
router.post("/send-otp", sendSignupOtp);

// Route for new user registration (verifies OTP)
router.post("/register", register);

// Route for user login
router.post("/login", login);

// Route to request forgot password OTP
router.post("/forgot-password", forgotPassword);

// Route to reset password with OTP
router.post("/reset-password", resetPassword);

export default router;
