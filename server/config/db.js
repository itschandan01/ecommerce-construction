import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      user: process.env.DB_USER || "postgres",
      host: process.env.DB_HOST || "localhost",
      database: process.env.DB_DATABASE || "construction_ecommerce",
      password: process.env.DB_PASSWORD || "123",
      port: Number(process.env.DB_PORT) || 5432,
    };

const pool = new Pool(poolConfig);

export default pool;
