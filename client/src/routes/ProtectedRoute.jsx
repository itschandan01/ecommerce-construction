import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_EMAIL = "adityaenterprisesofficial62@gmail.com";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading...</div>;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (adminOnly) {
    const userEmail = (user?.email || "").toLowerCase().trim();
    if (userEmail !== ADMIN_EMAIL) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
