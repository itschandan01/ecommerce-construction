// client/src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();        // ✅ backend logic preserved
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);   // ✅ backend call
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.error || "Invalid email or password"
      );
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign In</h2>

        {error && <p className="auth-error">{error}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div style={{ textAlign: "right", marginTop: "-5px", marginBottom: "15px" }}>
          <Link to="/forgot-password" style={{ fontSize: "13px", color: "#3182ce" }}>
            Forgot Password?
          </Link>
        </div>

        <button type="submit">Sign In</button>

        <p>
          Don&apos;t have an account?{" "}
          <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;