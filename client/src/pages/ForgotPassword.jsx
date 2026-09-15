// client/src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForgotPassword = () => {
  const { requestForgotPasswordOtp, resetPasswordWithOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter OTP + New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Step 1: Request Password Reset OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);

    try {
      const res = await requestForgotPasswordOtp(email);
      setInfoMessage(res.message || `A password reset code has been sent to ${email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send password reset email.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");

    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordWithOtp(email, otp, newPassword);
      alert("Password reset successfully! You can now log in with your new password.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Password reset failed. Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: "420px", width: "100%" }}>
        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestOtp}>
            <h2>Forgot Password</h2>
            <p className="auth-subtitle" style={{ color: "#718096", marginBottom: "15px" }}>
              Enter your registered email address to receive a 6-digit password reset code.
            </p>

            {error && <p className="auth-error">{error}</p>}

            <div className="form-group">
              <input
                type="email"
                placeholder="Registered Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={{ cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Sending Reset Code..." : "Send Reset Code"}
            </button>

            <p style={{ marginTop: "15px", textAlign: "center" }}>
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <h2>Reset Password</h2>
            <p className="auth-subtitle" style={{ color: "#4a5568", marginBottom: "15px" }}>
              Check your email <strong>{email}</strong> for the 6-digit OTP code.
            </p>

            {infoMessage && <p style={{ color: "#2b6cb0", backgroundColor: "#ebf8ff", padding: "10px", borderRadius: "4px", fontSize: "14px" }}>{infoMessage}</p>}
            {error && <p className="auth-error">{error}</p>}

            <div className="form-group" style={{ margin: "15px 0" }}>
              <label style={{ display: "block", fontWeight: "600", marginBottom: "5px" }}>6-Digit OTP Code</label>
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  fontSize: "22px",
                  letterSpacing: "6px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "8px"
                }}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading} style={{ cursor: loading ? "wait" : "pointer" }}>
              {loading ? "Resetting Password..." : "Reset Password & Login"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "14px" }}>
              <button
                type="button"
                onClick={handleRequestOtp}
                style={{ background: "none", border: "none", color: "#3182ce", cursor: "pointer", padding: 0 }}
              >
                Resend Code
              </button>
              <Link to="/login" style={{ color: "#718096" }}>
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
