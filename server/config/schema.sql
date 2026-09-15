-- ===================================================
-- Aditya Enterprises E-Commerce Database Schema (PostgreSQL)
-- ===================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(50),
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exact Application Categories Seed (Safe idempotent insert by name)
INSERT INTO categories (id, name, parent_id) VALUES
(1, 'Cement & Concrete', NULL),
(2, 'Bricks & Blocks', NULL),
(3, 'Steel & Reinforcement', NULL),
(4, 'Aggregates', NULL),
(5, 'Plumbing', NULL),
(6, 'Electrical', NULL),
(7, 'Finishing Materials', NULL),
(8, 'Tools & Equipment', NULL)
ON CONFLICT (name) DO NOTHING;

-- Sync category sequence
SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exact Application Products Seed (Safe idempotent insert by ID)
INSERT INTO products (id, name, description, price, stock_quantity, image_url, category_id) VALUES
(1, 'UltraTech OPC 53 Grade Cement', 'High-strength Portland cement bag for heavy construction & structural work (50kg).', 385.00, 250, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60', 1),
(2, 'TATA Tiscon 12mm TMT Rebar', 'High ductile FE 500D TMT steel rebar for earthquake resistant buildings (12m bundle).', 645.00, 150, 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60', 3),
(3, 'AAC Lightweight Building Blocks', 'Autoclaved Aerated Concrete thermal insulation wall blocks (600x200x150mm).', 65.00, 1200, 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=500&auto=format&fit=crop&q=60', 2),
(4, 'Finolex CPVC Heavy Plumbing Pipe', 'Hot & cold water pressure plumbing pipe 1 inch (3 meter length).', 240.00, 80, 'https://images.unsplash.com/photo-1542013936693-884638332954?w=500&auto=format&fit=crop&q=60', 5)
ON CONFLICT (id) DO NOTHING;

-- Sync product sequence
SELECT setval('products_id_seq', COALESCE((SELECT MAX(id) FROM products), 1));

-- 4. Addresses Table
CREATE TABLE IF NOT EXISTS addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  phone VARCHAR(50),
  address_line TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  address_id INTEGER REFERENCES addresses(id) ON DELETE SET NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'PENDING',
  status VARCHAR(50) DEFAULT 'PLACED',
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
);

-- 7. Email OTPs Table
CREATE TABLE IF NOT EXISTS email_otps (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  otp VARCHAR(10) NOT NULL,
  purpose VARCHAR(50) DEFAULT 'signup',
  expires_at BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
