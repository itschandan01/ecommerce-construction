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
      <div className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <h2>Create Account</h2>
            <p className="auth-subtitle" style={{ color: "#718096", marginBottom: "15px" }}>
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
                placeholder="Delivery Address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading} style={{ cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Sending Verification Code..." : "Send 6-Digit Verification Code"}
            </button>

            <p style={{ marginTop: "15px", textAlign: "center" }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyAndRegister}>
            <h2>Verify Your Email</h2>
            <p className="auth-subtitle" style={{ color: "#4a5568", marginBottom: "15px" }}>
              We sent a 6-digit verification code to <strong>{formData.email}</strong>.
            </p>

            {infoMessage && <p style={{ color: "#2b6cb0", backgroundColor: "#ebf8ff", padding: "10px", borderRadius: "4px", fontSize: "14px" }}>{infoMessage}</p>}
            {error && <p className="auth-error">{error}</p>}

            <div className="form-group" style={{ margin: "20px 0" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "8px" }}>Enter 6-Digit OTP Code</label>
              <input
                type="text"
                name="otp"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  fontSize: "24px",
                  letterSpacing: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "10px"
                }}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={{ cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Verifying..." : "Verify & Complete Registration"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "14px" }}>
              <button
                type="button"
                onClick={handleSendOtp}
                style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", padding: 0 }}
              >
                Resend OTP
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#718096", cursor: "pointer", padding: 0 }}
              >
                Change Email / Details
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;