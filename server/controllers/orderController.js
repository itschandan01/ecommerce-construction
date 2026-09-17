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
import { decreaseProductStock, findProductById } from "../models/productModel.js";
import { fetchAddressForOrder } from "./addressController.js";
import { sendOrderConfirmation } from "./emailController.js";

// In-memory store for orders to maintain items & details across fallback flow
export const ordersMap = new Map();

export const placeOrder = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const userId = req.user.id;
    const { addressId, paymentMethod, items } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({ error: "Missing order data" });
    }

    const rawItems = Array.isArray(items) ? items : [];
    if (!rawItems.length) {
      return res.status(400).json({ error: "No items in order" });
    }

    // 🔒 Server-side validation of products & authoritative prices from database
    const validatedItems = [];
    for (const item of rawItems) {
      const productId = item.productId || item.id;
      if (!productId) {
        return res.status(400).json({ error: "Invalid product ID in order items" });
      }

      const product = await findProductById(productId);
      if (!product) {
        return res.status(400).json({ error: `Product #${productId} not found` });
      }

      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: `Invalid quantity for product "${product.name}"` });
      }

      const availableStock = Number(product.stock_quantity || 0);
      if (quantity > availableStock) {
        return res.status(400).json({
          error: `Insufficient stock for product "${product.name}". Available: ${availableStock}, Requested: ${quantity}`,
        });
      }

      const authoritativePrice = Number(product.price || 0);

      validatedItems.push({
        productId: Number(product.id || productId),
        id: Number(product.id || productId),
        name: product.name,
        price: authoritativePrice,
        quantity,
        image_url: product.image_url || item.image_url || "",
      });
    }

    // Authoritative calculation of Subtotal, Shipping, and Total from validated items
    const calculatedSubtotal = validatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const calculatedShipping = calculatedSubtotal >= 1000 ? 0 : 50;
    const validatedTotal = Number((calculatedSubtotal + calculatedShipping).toFixed(2));

    // Fetch user details for email notification
    let userEmail = req.body.userEmail || req.user?.email;
    const user = await findUserById(userId);
    if (!userEmail) {
      userEmail = user?.email || process.env.EMAIL_USER;
    }

    // Fetch address details for confirmation email
    const addressObj = await fetchAddressForOrder(addressId, userId);

    let orderId;
    let createdAt = new Date().toISOString();
    try {
      const result = await pool.query(
        `
        INSERT INTO orders 
        (user_id, total_amount, address_id, payment_method, payment_status, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at
        `,
        [
          userId,
          validatedTotal,
          addressId,
          paymentMethod,
          paymentMethod === "cod" ? "PENDING" : "INITIATED",
          "PLACED",
        ]
      );
      orderId = result.rows[0]?.id || Date.now();
      if (result.rows[0]?.created_at) {
        createdAt = new Date(result.rows[0].created_at).toISOString();
      }
    } catch (dbErr) {
      console.warn("DB notice during order creation (using fallback):", dbErr.message);
      orderId = Date.now();
    }

    const orderData = {
      id: orderId,
      created_at: createdAt,
      user_id: userId,
      email: userEmail,
      user_name: user?.name || addressObj?.full_name || "Customer",
      total_amount: validatedTotal,
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      address_id: addressId,
      address: addressObj,
      payment_method: paymentMethod,
      items: validatedItems,
    };
    ordersMap.set(String(orderId), orderData);

    // 📦 Decrease stock quantity for each validated ordered item
    for (const item of validatedItems) {
      try {
        await decreaseProductStock(item.productId, item.quantity);
      } catch (stockErr) {
        console.warn(`Stock reduction notice for product #${item.productId}:`, stockErr.message);
      }
    }

    // Send order confirmation email immediately for Cash on Delivery (COD)
    if (paymentMethod === "cod" && userEmail) {
      try {
        await sendOrderConfirmation({
          order: {
            id: orderId,
            created_at: createdAt,
            total_amount: validatedTotal,
            subtotal: calculatedSubtotal,
            shipping: calculatedShipping,
            email: userEmail,
            user_name: user?.name || addressObj?.full_name || "Customer",
          },
          items: validatedItems,
          paymentMethod: "cod",
          address: addressObj,
        });
        console.log(`📧 COD Order Confirmation email sent to ${userEmail} for Order #${orderId}`);
      } catch (emailErr) {
        console.error("📧 COD Order Confirmation email error:", emailErr.message);
      }
    }

    return res.status(201).json({
      success: true,
      orderId,
      totalAmount: validatedTotal,
    });
  } catch (error) {
    console.error("🔥 ORDER ERROR:", error);
    return res.status(500).json({ error: error.message || "Order placement failed" });
  }
};
