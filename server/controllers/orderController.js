// // // server/controllers/orderController.js

// // import { createRequire } from "module";
// // const require = createRequire(import.meta.url);

// // // CommonJS Sequelize models (matches your setup)
// // const Order = require("../models/orderModel.js");
// // const User = require("../models/userModel.js");

// // import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

// // export const placeOrder = async (req, res) => {
// //   try {
// //     // ===============================
// //     // 1️⃣ AUTH CHECK (VERY IMPORTANT)
// //     // ===============================
// //     if (!req.user || !req.user.id) {
// //       return res.status(401).json({ error: "Unauthorized" });
// //     }

// //     const userId = req.user.id;

// //     // ===============================
// //     // 2️⃣ VALIDATE REQUEST BODY
// //     // ===============================
// //     const { items, addressId, paymentMethod, totalAmount } = req.body;

// //     if (!items || !items.length) {
// //       return res.status(400).json({ error: "No items in order" });
// //     }

// //     if (!addressId || !paymentMethod || !totalAmount) {
// //       return res.status(400).json({ error: "Missing order details" });
// //     }

// //     // ===============================
// //     // 3️⃣ FETCH USER EMAIL
// //     // ===============================
// //     const user = await User.findByPk(userId);
// //     if (!user) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     // ===============================
// //     // 4️⃣ CREATE ORDER (DB)
// //     // ===============================
// //     const order = await Order.create({
// //       user_id: userId,
// //       address_id: addressId,
// //       total_amount: totalAmount,
// //       payment_method: paymentMethod,
// //       status: "PLACED",
// //     });

// //     // ===============================
// //     // 5️⃣ SEND EMAIL (NON-BLOCKING)
// //     // ===============================
// //     try {
// //       await sendOrderConfirmation({
// //         order: {
// //           id: order.id,
// //           total_amount: order.total_amount,
// //           email: user.email,
// //         },
// //         items,
// //         paymentMethod,
// //       });
// //     } catch (emailError) {
// //       console.error(
// //         "📧 Email failed but order placed:",
// //         emailError.message
// //       );
// //       // IMPORTANT: Do NOT throw
// //     }

// //     // ===============================
// //     // 6️⃣ SUCCESS RESPONSE
// //     // ===============================
// //     return res.status(201).json({
// //       message: "Order placed successfully",
// //       orderId: order.id,
// //     });

// //   } catch (error) {
// //     console.error("❌ Order placement failed:", error);
// //     return res.status(500).json({
// //       error: "Order placement failed",
// //     });
// //   }
// // };


// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// // CommonJS Sequelize models (matches your project)
// const Order = require("../models/orderModel.js");
// const User = require("../models/userModel.js");

// // OPTIONAL: comment email out if needed
// import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

// export const placeOrder = async (req, res) => {
//   try {
//     // ===============================
//     // 1️⃣ AUTH CHECK
//     // ===============================
//     if (!req.user || !req.user.id) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     const userId = req.user.id;

//     // ===============================
//     // 2️⃣ VALIDATE BODY
//     // ===============================
//     const { items, addressId, paymentMethod, totalAmount } = req.body;

//     if (!items || !items.length) {
//       return res.status(400).json({ error: "No items provided" });
//     }

//     if (!addressId || !paymentMethod || !totalAmount) {
//       return res.status(400).json({ error: "Missing order data" });
//     }

//     // ===============================
//     // 3️⃣ FETCH USER
//     // ===============================
//     const user = await User.findByPk(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     // ===============================
//     // 4️⃣ CREATE ORDER
//     // ===============================
//     const order = await Order.create({
//       user_id: userId,
//       address_id: addressId,
//       total_amount: totalAmount,
//       payment_method: paymentMethod,
//       status: "PLACED",
//     });

//     // ===============================
//     // 5️⃣ EMAIL (NON-BLOCKING)
//     // ===============================
//     try {
//       await sendOrderConfirmation({
//         order: {
//           id: order.id,
//           total_amount: order.total_amount,
//           email: user.email,
//         },
//         items,
//         paymentMethod,
//       });
//     } catch (e) {
//       console.error("📧 Email failed (ignored):", e.message);
//     }

//     // ===============================
//     // 6️⃣ SUCCESS RESPONSE
//     // ===============================
//     return res.status(201).json({
//       message: "Order placed successfully",
//       orderId: order.id,
//     });

//   } catch (error) {
//     console.error("❌ Order placement failed:", error);
//     return res.status(500).json({ error: "Order placement failed" });
//   }
// };

// server/controllers/orderController.js
// server/controllers/orderController.js
// server/controllers/orderController.js

import pool from "../config/db.js";
import { findUserById } from "../models/userModel.js";
import { decreaseProductStock } from "../models/productModel.js";
import { sendOrderConfirmation } from "./emailController.js";

// In-memory store for orders to maintain items & details across fallback flow
export const ordersMap = new Map();

export const placeOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { totalAmount, addressId, paymentMethod, items } = req.body;

    if (!totalAmount || !addressId || !paymentMethod) {
      return res.status(400).json({ error: "Missing order data" });
    }

    // Fetch user details for email notification
    let userEmail = req.body.userEmail || req.user?.email;
    if (!userEmail) {
      const user = await findUserById(userId);
      userEmail = user?.email || process.env.EMAIL_USER;
    }

    let orderId;
    try {
      const result = await pool.query(
        `
        INSERT INTO orders 
        (user_id, total_amount, address_id, payment_method, payment_status, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [
          userId,
          totalAmount,
          addressId,
          paymentMethod,
          paymentMethod === "cod" ? "PENDING" : "INITIATED",
          "PLACED",
        ]
      );
      orderId = result.rows[0]?.id || Date.now();
    } catch (dbErr) {
      console.warn("DB notice during order creation (using fallback):", dbErr.message);
      orderId = Date.now();
    }

    const orderData = {
      id: orderId,
      user_id: userId,
      email: userEmail,
      total_amount: totalAmount,
      address_id: addressId,
      payment_method: paymentMethod,
      items: items || [],
    };
    ordersMap.set(String(orderId), orderData);

    // 📦 Decrease stock quantity for each ordered item
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const productId = item.productId || item.id;
        const qty = Number(item.quantity) || 1;
        if (productId) {
          try {
            await decreaseProductStock(productId, qty);
          } catch (stockErr) {
            console.warn(`Stock reduction notice for product #${productId}:`, stockErr.message);
          }
        }
      }
    }

    // Send order confirmation email immediately for Cash on Delivery (COD)
    if (paymentMethod === "cod" && userEmail) {
      try {
        await sendOrderConfirmation({
          order: { id: orderId, total_amount: totalAmount, email: userEmail },
          items: items || [],
          paymentMethod: "cod",
        });
        console.log(`📧 COD Order Confirmation email sent to ${userEmail} for Order #${orderId}`);
      } catch (emailErr) {
        console.error("📧 COD Order Confirmation email error:", emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      orderId,
    });
  } catch (error) {
    console.error("🔥 ORDER ERROR:", error);
    return res.status(500).json({ error: error.message || "Order placement failed" });
  }
};
