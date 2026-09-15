
// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// // Context Providers
// import { AuthProvider } from "./context/AuthContext";
// import { CartProvider } from "./context/CartContext";

// // Route Protection
// import ProtectedRoute from "./routes/ProtectedRoute";

// // Pages
// import HomePage from "./pages/Homepage";
// import Register from "./pages/Register";
// import Login from "./pages/Login";
// import Cart from "./pages/Cart";
// import CheckoutAddress from "./pages/CheckoutAddress";
// import CheckoutPayment from "./pages/CheckoutPayment";
// import OrderConfirmation from "./pages/OrderConfirmation";
// import AddProduct from "./pages/AddProduct";
// import InventoryManager from "./pages/InventoryManager";

// // Global CSS
// import "./App.css";

// const App = () => {
//   return (
//     <Router>
//       <AuthProvider>
//         <CartProvider>
//           <Routes>
//             {/* ---------- Public Routes ---------- */}
//             <Route path="/" element={<HomePage />} />
//             <Route path="/register" element={<Register />} />
//             <Route path="/login" element={<Login />} />

//             {/* ---------- Cart ---------- */}
//             <Route path="/cart" element={<Cart />} />

//             {/* ---------- Protected Checkout Flow ---------- */}
//             <Route
//               path="/checkout/address"
//               element={
//                 <ProtectedRoute>
//                   <CheckoutAddress />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/checkout/payment"
//               element={
//                 <ProtectedRoute>
//                   <CheckoutPayment />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/order-confirmation"
//               element={
//                 <ProtectedRoute>
//                   <OrderConfirmation />
//                 </ProtectedRoute>
//               }
//             />

//             {/* ---------- Admin / Owner Routes ---------- */}
//             <Route
//               path="/add-product"
//               element={
//                 <ProtectedRoute>
//                   <AddProduct />
//                 </ProtectedRoute>
//               }
//             />

//             <Route
//               path="/inventory"
//               element={
//                 <ProtectedRoute>
//                   <InventoryManager />
//                 </ProtectedRoute>
//               }
//             />

//             {/* ---------- Fallback ---------- */}
//             <Route path="*" element={<HomePage />} />
//           </Routes>
//         </CartProvider>
//       </AuthProvider>
//     </Router>
//   );
// };

// export default App;




//after changes

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Route Protection
import ProtectedRoute from "./routes/ProtectedRoute";

// Pages
import HomePage from "./pages/Homepage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Cart from "./pages/Cart";
import CheckoutAddress from "./pages/CheckoutAddress";
import CheckoutPayment from "./pages/CheckoutPayment";
import OrderConfirmation from "./pages/OrderConfirmation";
import AddProduct from "./pages/AddProduct";
import InventoryManager from "./pages/InventoryManager";

// ✅ Admin Pages
import AdminOrders from "./admin/AdminOrders";

// Global CSS
import "./App.css";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ---------- Public Routes ---------- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* ---------- Cart ---------- */}
            <Route path="/cart" element={<Cart />} />

            {/* ---------- Protected Checkout Flow ---------- */}
            <Route
              path="/checkout/address"
              element={
                <ProtectedRoute>
                  <CheckoutAddress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/checkout/payment"
              element={
                <ProtectedRoute>
                  <CheckoutPayment />
                </ProtectedRoute>
              }
            />

            <Route
              path="/order-confirmation"
              element={
                <ProtectedRoute>
                  <OrderConfirmation />
                </ProtectedRoute>
              }
            />

            {/* ---------- Admin / Owner Routes ---------- */}
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />

            <Route
              path="/inventory"
              element={
                <ProtectedRoute>
                  <InventoryManager />
                </ProtectedRoute>
              }
            />

            {/* ✅ Admin Orders */}
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />

            {/* ---------- Fallback ---------- */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;

