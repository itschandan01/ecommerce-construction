import pool from "../config/db.js";

/**
 * Creates a new order record within a transaction.
 * Amounts are treated as ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
export const createOrder = async (client, userId, totalAmountInr, addressId) => {
  const dbClient = client || pool;
  const result = await dbClient.query(
    `INSERT INTO orders (user_id, total_amount, address_id, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, total_amount`,
    [userId, totalAmountInr, addressId || null, "PENDING"]
  );

  return result.rows[0];
};

/**
 * Inserts an order item record within a transaction.
 * priceAtPurchase is ₹ INR.
 * Requires a PostgreSQL client object from a transaction.
 */
export const createOrderItem = async (
  client,
  orderId,
  productId,
  quantity,
  priceAtPurchaseInr
) => {
  const dbClient = client || pool;
  await dbClient.query(
    `INSERT INTO order_items
     (order_id, product_id, quantity, price_at_purchase)
     VALUES ($1, $2, $3, $4)`,
    [orderId, productId, quantity, priceAtPurchaseInr]
  );
};
