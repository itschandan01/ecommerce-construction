// import pool from "../config/db.js";

// /* GET all orders (owner only) */
// export const getAllOrders = async (req, res) => {
//   try {
//     if (req.user.id !== 1) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const result = await pool.query(`
//       SELECT 
//         o.id,
//         o.total_amount,
//         o.status,
//         o.created_at,
//         u.name AS customer_name
//       FROM orders o
//       JOIN users u ON o.user_id = u.id
//       ORDER BY o.created_at DESC
//     `);

//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Failed to fetch orders" });
//   }
// };

// /* UPDATE order status */
// export const updateOrderStatus = async (req, res) => {
//   try {
//     if (req.user.id !== 1) {
//       return res.status(403).json({ message: "Unauthorized" });
//     }

//     const { id } = req.params;
//     const { status } = req.body;

//     await pool.query(
//       "UPDATE orders SET status=$1 WHERE id=$2",
//       [status, id]
//     );

//     res.json({ message: "Status updated" });
//   } catch (err) {
//     res.status(500).json({ message: "Update failed" });
//   }
// };



import pool from "../config/db.js";

/* ===============================
   GET all orders (OWNER ONLY)
   =============================== */
export const getAllOrders = async (req, res) => {
  try {
    // 🔐 Owner check
    if (
      !req.user ||
      Number(req.user.id) !== Number(process.env.OWNER_USER_ID)
    ) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const result = await pool.query(`
      SELECT 
        o.id,
        o.total_amount,
        o.status,
        o.order_date,
        o.payment_status,
        u.name AS customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("❌ GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

/* ===============================
   UPDATE order status (OWNER ONLY)
   =============================== */
export const updateOrderStatus = async (req, res) => {
  try {
    // 🔐 Owner check
    if (
      !req.user ||
      Number(req.user.id) !== Number(process.env.OWNER_USER_ID)
    ) {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "done"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    await pool.query(
      `
      UPDATE orders 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      `,
      [status, id]
    );

    res.status(200).json({ message: "Order status updated successfully" });
  } catch (err) {
    console.error("❌ UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};
