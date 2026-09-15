import pool from "../config/db.js";
export const findProductById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
/**
 * Fetch all products with category info
 * Prices are stored and treated as INR (₹)
 */
export const findAllProducts = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,              -- INR
        p.stock_quantity,
        p.image_url,
        p.category_id,
        COALESCE(c.name, 'Uncategorized') AS category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    return result.rows;
  } catch (err) {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.category_id,
        COALESCE(c.name, 'Uncategorized') AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC
    `);
    return result.rows;
  }
};

/**
 * Create a new product (₹ INR)
 */
export const createProduct = async (
  name,
  description,
  priceInr,
  stock_quantity,
  image_url,
  category_id
) => {
  const result = await pool.query(
    `INSERT INTO products
     (name, description, price, stock_quantity, image_url, category_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, priceInr, stock_quantity, image_url, category_id]
  );

  return result.rows[0];
};

/**
 * Update an existing product (₹ INR)
 */
export const updateProduct = async (
  id,
  name,
  description,
  priceInr,
  stock_quantity,
  image_url,
  category_id
) => {
  const result = await pool.query(
    `UPDATE products
     SET name = $1,
         description = $2,
         price = $3,          -- INR
         stock_quantity = $4,
         image_url = $5,
         category_id = $6
     WHERE id = $7
     RETURNING *`,
    [name, description, priceInr, stock_quantity, image_url, category_id, id]
  );

  return result.rows[0];
};

/**
 * Delete product
 */
export const deleteProduct = async (id) => {
  await pool.query("DELETE FROM products WHERE id = $1", [id]);
};
