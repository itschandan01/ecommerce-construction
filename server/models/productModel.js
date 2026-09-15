import pool from "../config/db.js";

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "UltraTech OPC 53 Grade Cement",
    description: "High-strength Portland cement bag for heavy construction & structural work (50kg).",
    price: 385.00,
    stock_quantity: 250,
    image_url: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60",
    category_id: 1,
    category_name: "Cement & Concrete",
    created_at: new Date(),
  },
  {
    id: 2,
    name: "TATA Tiscon 12mm TMT Rebar",
    description: "High ductile FE 500D TMT steel rebar for earthquake resistant buildings (12m bundle).",
    price: 645.00,
    stock_quantity: 150,
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
    category_id: 3,
    category_name: "Steel & Reinforcement",
    created_at: new Date(),
  },
  {
    id: 3,
    name: "AAC Lightweight Building Blocks",
    description: "Autoclaved Aerated Concrete thermal insulation wall blocks (600x200x150mm).",
    price: 65.00,
    stock_quantity: 1200,
    image_url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60",
    category_id: 2,
    category_name: "Bricks & Blocks",
    created_at: new Date(),
  },
  {
    id: 4,
    name: "Finolex CPVC Heavy Plumbing Pipe",
    description: "Hot & cold water pressure plumbing pipe 1 inch (3 meter length).",
    price: 240.00,
    stock_quantity: 80,
    image_url: "https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop&q=60",
    category_id: 5,
    category_name: "Plumbing",
    created_at: new Date(),
  },
];

const memoryProducts = [...DEFAULT_PRODUCTS];

export const findProductById = async (id) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
    );
    if (result.rows.length > 0) return result.rows[0];
  } catch (err) {
    // Fallback
  }
  return memoryProducts.find((p) => p.id === Number(id)) || null;
};

export const findAllProducts = async () => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock_quantity,
        p.image_url,
        p.category_id,
        COALESCE(c.name, 'Uncategorized') AS category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    if (result.rows.length > 0) return result.rows;
  } catch (err) {
    try {
      const fallback = await pool.query(`
        SELECT 
          p.id, p.name, p.description, p.price, p.stock_quantity, p.image_url, p.category_id,
          COALESCE(c.name, 'Uncategorized') AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ORDER BY p.id DESC
      `);
      if (fallback.rows.length > 0) return fallback.rows;
    } catch (dbErr) {
      console.warn("DB offline notice (products):", dbErr.message);
    }
  }

  return memoryProducts;
};

export const createProduct = async (
  name,
  description,
  priceInr,
  stock_quantity,
  image_url,
  category_id
) => {
  const newProduct = {
    id: memoryProducts.length + 1,
    name,
    description,
    price: priceInr,
    stock_quantity,
    image_url,
    category_id,
    category_name: "General",
    created_at: new Date(),
  };
  memoryProducts.unshift(newProduct);

  try {
    const result = await pool.query(
      `INSERT INTO products
       (name, description, price, stock_quantity, image_url, category_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, priceInr, stock_quantity, image_url, category_id]
    );
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (createProduct):", err.message);
  }

  return newProduct;
};

export const updateProduct = async (
  id,
  name,
  description,
  priceInr,
  stock_quantity,
  image_url,
  category_id
) => {
  const index = memoryProducts.findIndex((p) => p.id === Number(id));
  if (index !== -1) {
    memoryProducts[index] = {
      ...memoryProducts[index],
      name,
      description,
      price: priceInr,
      stock_quantity,
      image_url,
      category_id,
    };
  }

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1, description = $2, price = $3, stock_quantity = $4, image_url = $5, category_id = $6
       WHERE id = $7 RETURNING *`,
      [name, description, priceInr, stock_quantity, image_url, category_id, id]
    );
    if (result.rows[0]) return result.rows[0];
  } catch (err) {
    console.warn("DB notice (updateProduct):", err.message);
  }

  return memoryProducts[index];
};

export const deleteProduct = async (id) => {
  const index = memoryProducts.findIndex((p) => p.id === Number(id));
  if (index !== -1) memoryProducts.splice(index, 1);

  try {
    await pool.query("DELETE FROM products WHERE id = $1", [id]);
  } catch (err) {
    console.warn("DB notice (deleteProduct):", err.message);
  }
};

/**
 * Decreases stock quantity for a product when an order is placed.
 */
export const decreaseProductStock = async (productId, quantityOrdered) => {
  const numQty = Number(quantityOrdered) || 0;
  if (numQty <= 0) return;

  // 1. Decrease in memoryProducts (for local fallback)
  const product = memoryProducts.find((p) => p.id === Number(productId));
  if (product) {
    product.stock_quantity = Math.max(0, Number(product.stock_quantity || 0) - numQty);
    console.log(`📦 Stock updated in memory for product #${productId} (${product.name}): New stock = ${product.stock_quantity}`);
  }

  // 2. Decrease in PostgreSQL database
  try {
    await pool.query(
      `UPDATE products 
       SET stock_quantity = GREATEST(0, stock_quantity - $1)
       WHERE id = $2`,
      [numQty, productId]
    );
    console.log(`📦 Stock updated in DB for product #${productId}: -${numQty}`);
  } catch (err) {
    console.warn(`DB notice (decreaseProductStock for #${productId}):`, err.message);
  }
};
