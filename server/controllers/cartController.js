import pool from "../config/db.js";
import { sendOrderConfirmation } from "./emailController.js";
import { findUserById } from "../models/userModel.js";
import {
  createOrder as createOrderModel,
  createOrderItem,
} from "../models/orderModel.js";

/**
 * @route   POST /api/orders
 * @desc    Initial order creation (Status: PENDING)
 * @access  Protected
 */
export const createOrder = async (req, res) => {
  const { items, totalAmount, addressId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Create the order record (Set to PENDING by default in DB or Model)
    const order = await createOrderModel(
      client,
      userId,
      Number(totalAmount),
      addressId
    );
    const orderId = order.id;

    // 2️⃣ Create order items
    for (const item of items) {
      const { productId, quantity, price } = item;
      await createOrderItem(
        client,
        orderId,
        productId,
        quantity,
        Number(price)
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ 
      message: "Order initiated", 
      orderId: orderId 
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Order creation error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

/**
 * @route   POST /api/orders/verify
 * @desc    Update status, deduct stock, and send email after payment
 * @access  Protected
 */
export const verifyPayment = async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Update order status to PAID
    const orderResult = await client.query(
      "UPDATE orders SET status = 'PAID', paid_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *",
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      throw new Error("Order not found");
    }
    const order = orderResult.rows[0];

    // 2️⃣ Fetch items to deduct stock
    const itemsResult = await client.query(
      "SELECT oi.*, p.name FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1",
      [orderId]
    );
    const items = itemsResult.rows;

    const itemDetailsForEmail = [];

    // 3️⃣ Deduct stock for each item
    for (const item of items) {
      const updateRes = await client.query(
        "UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2 AND stock_quantity >= $1 RETURNING name",
        [item.quantity, item.product_id]
      );

      if (updateRes.rows.length === 0) {
        throw new Error(`Insufficient stock for product ID: ${item.product_id}`);
      }

      itemDetailsForEmail.push({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price)
      });
    }

    // 4️⃣ Commit transaction
    await client.query("COMMIT");

    // 5️⃣ Fetch User details and Send Email
    const user = await findUserById(userId);
    await sendOrderConfirmation(
      user.email,
      order,
      itemDetailsForEmail
    );

    res.status(200).json({
      success: true,
      message: "Payment verified, stock updated, and email sent",
      orderId
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Payment verification error:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};