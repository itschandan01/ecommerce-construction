// // server/server.js

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";

// // ===============================
// // Load environment variables
// // ===============================
// dotenv.config();

// // ===============================
// // App init
// // ===============================
// const app = express();
// const PORT = process.env.PORT || 5001;

// // ===============================
// // Middleware (ORDER MATTERS)
// // ===============================
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//   })
// );

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ===============================
// // Database connection
// // ===============================
// import "./config/db.js";

// // ===============================
// // Routes
// // ===============================
// import authRoutes from "./routes/authRoutes.js";
// import productRoutes from "./routes/productRoutes.js";
// import categoryRoutes from "./routes/categoryRoutes.js";
// import addressRoutes from "./routes/addressRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";

// // ===============================
// // Health check
// // ===============================
// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "OK",
//     message: "Construction E-commerce API running",
//   });
// });

// // ===============================
// // API routes
// // ===============================
// app.use("/api/auth", authRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/categories", categoryRoutes);
// app.use("/api/addresses", addressRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/payment", paymentRoutes);

// // ===============================
// // 404 handler (must be last route)
// // ===============================
// app.use((req, res) => {
//   res.status(404).json({
//     error: "Route not found",
//   });
// });

// // ===============================
// // Global error handler
// // ===============================
// app.use((err, req, res, next) => {
//   console.error("❌ Unhandled Error:", err);

//   if (res.headersSent) {
//     return next(err);
//   }

//   res.status(err.status || 500).json({
//     error: err.message || "Internal Server Error",
//   });
// });

// // ===============================
// // Start server
// // ===============================
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📧 Email User Loaded: ${process.env.EMAIL_USER || "not set"}`);
// });


//after changes 

// server/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// ===============================
// Load environment variables
// ===============================
dotenv.config();

// ===============================
// App init
// ===============================
const app = express();
const PORT = process.env.PORT || 5001;

// ===============================
// Middleware (ORDER MATTERS)
// ===============================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// Database connection
// ===============================
import "./config/db.js";

// ===============================
// Routes
// ===============================
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// ✅ Admin Orders Routes
import adminOrderRoutes from "./routes/adminOrderRoutes.js";

// ===============================
// Health check
// ===============================
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Construction E-commerce API running",
  });
});

// ===============================
// API routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

// ✅ Admin / Owner APIs
app.use("/api/admin", adminOrderRoutes);

// ===============================
// 404 handler (must be last route)
// ===============================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ===============================
// Global error handler
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Unhandled Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ===============================
// Start server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email User Loaded: ${process.env.EMAIL_USER || "not set"}`);
});
