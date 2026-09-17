// client/src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const { sendSignupOtp, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Form Input, 2 = OTP Verification
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    phone_number: "",
  });
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Step 1: Send OTP to User Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await sendSignupOtp(formData.email, formData.name);
      setInfoMessage(res.message || `A 6-digit OTP was sent to ${formData.email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Create Account
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      await register({ ...formData, otp });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "480px", width: "100%" }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: step === 1 ? 'var(--color-orange-primary)' : 'var(--color-bg-light)', color: step === 1 ? '#fff' : 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
            1. Account Details
          </div>
          <div style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: step === 2 ? 'var(--color-orange-primary)' : 'var(--color-bg-light)', color: step === 2 ? '#fff' : 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700 }}>
            2. Email Verification
          </div>
        </div>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendOtp} style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <h2>Create Your Account</h2>
            <p className="auth-subtitle">
              Fill in your details to receive a 6-digit email verification code.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Delivery Address (Optional)"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone_number"
                placeholder="Phone Number (Optional)"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Sending Verification Code..." : "Send 6-Digit Code"}
            </button>

            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
              Already have an account? <Link to="/login" style={{ color: "var(--color-orange-primary)", fontWeight: 700 }}>Sign in</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyAndRegister} style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <h2>Verify Your Email</h2>
            <p className="auth-subtitle">
              We sent a 6-digit verification code to <strong style={{ color: 'var(--color-orange-primary)' }}>{formData.email}</strong>.
            </p>

            {infoMessage && (
              <p style={{ color: "#1e40af", backgroundColor: "#dbeafe", padding: "12px", borderRadius: "var(--radius-sm)", fontSize: "0.88rem", marginBottom: '1rem', border: '1px solid #bfdbfe' }}>
                {infoMessage}
              </p>
            )}
            {error && <p className="auth-error">{error}</p>}

            <div className="form-group" style={{ margin: "20px 0" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "8px", fontSize: '0.9rem' }}>
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                name="otp"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  fontSize: "26px",
                  letterSpacing: "10px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "12px",
                  borderRadius: "var(--radius-md)"
                }}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", fontSize: "0.88rem" }}>
              <button
                type="button"
                onClick={handleSendOtp}
                style={{ background: "none", border: "none", color: "var(--color-orange-primary)", cursor: "pointer", fontWeight: 600 }}
              >
                Resend OTP Code
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "var(--color-text-muted)", cursor: "pointer" }}
              >
                ← Edit Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;