// server/middleware/authMiddleware.js
// import jwt from "jsonwebtoken";

// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Not authorized" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = { id: decoded.id };
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

// export default authMiddleware;
// import jwt from "jsonwebtoken";
// import pool from "../config/db.js";

// export const protect = async (req, res, next) => {
//   try {
//     let token;

//     if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ error: "Not authorized, token missing" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const userRes = await pool.query(
//       "SELECT id, email FROM users WHERE id = $1",
//       [decoded.id]
//     );

//     if (userRes.rows.length === 0) {
//       return res.status(401).json({ error: "User not found" });
//     }

//     req.user = userRes.rows[0];
//     next();
//   } catch (err) {
//     console.error("Auth error:", err.message);
//     res.status(401).json({ error: "Not authorized" });
//   }
// };

// server/middleware/authMiddleware.js
// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Not authorized" });
//   }

//   try {
//     const token = authHeader.split(" ")[1];
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

// import jwt from "jsonwebtoken";

// export const protect = (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const token = authHeader.split(" ")[1];

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ MUST exist
//     req.user = decoded;

//     next();
//   } catch (error) {
//     console.error("Auth error:", error.message);
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    let token;

    // ✅ Accept both lowercase & uppercase headers
    const authHeader =
      req.headers.authorization || req.headers.Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ VERY IMPORTANT
    req.user = { id: decoded.id };

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};

