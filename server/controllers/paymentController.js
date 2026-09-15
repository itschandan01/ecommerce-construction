// server/controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";

let razorpay = null;

/**
 * Get Razorpay instance safely
 * (Prevents server crash if env vars are missing)
 */
const getRazorpayInstance = () => {
  if (!razorpay) {
    if (!process.env.RAZORPAY_KEY || !process.env.RAZORPAY_SECRET) {
      throw new Error("Razorpay keys not configured");
    }

    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }
  return razorpay;
};

/**
 * CREATE RAZORPAY PAYMENT ORDER
 * POST /api/payment/create
 */
export const createPayment = async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({ error: "Amount and orderId required" });
    }

    const razorpayInstance = getRazorpayInstance();

    const paymentOrder = await razorpayInstance.orders.create({
      amount: Math.round(amount * 100), // INR → paise
      currency: "INR",
      receipt: `order_${orderId}`,
    });

    return res.json(paymentOrder);
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    return res.status(500).json({
      error: err.message || "Failed to create payment",
    });
  }
};

/**
 * VERIFY RAZORPAY PAYMENT
 * POST /api/payment/verify
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res.status(400).json({ error: "Invalid payment data" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Payment verification failed" });
    }

    // Mark order as paid
    await pool.query(
      `
      UPDATE orders
      SET status = 'PAID',
          paid_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      `,
      [orderId]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    return res.status(500).json({
      error: err.message || "Payment verification failed",
    });
  }
};
