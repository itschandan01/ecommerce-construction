// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <form className="auth-form" onSubmit={handleSubmit} style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🏗️</div>
            <h2>Sign In to Aditya Enterprises</h2>
            <p className="auth-subtitle">
              Access your order history, site deliveries, and saved account details.
            </p>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ textAlign: "right", marginTop: "-5px", marginBottom: "15px" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--color-orange-primary)", fontWeight: 600 }}>
              Forgot Password?
            </Link>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link to="/register" style={{ color: "var(--color-orange-primary)", fontWeight: 700 }}>
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;