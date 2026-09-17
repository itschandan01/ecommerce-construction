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
      <div className="auth-card" style={{ maxWidth: "450px", width: "100%" }}>
        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestOtp} style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔑</div>
              <h2>Forgot Password</h2>
              <p className="auth-subtitle">
                Enter your registered email address to receive a 6-digit password reset code.
              </p>
            </div>

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

            <button type="submit" disabled={loading}>
              {loading ? "Sending Reset Code..." : "Send Reset Code"}
            </button>

            <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
              Remember your password? <Link to="/login" style={{ color: "var(--color-orange-primary)", fontWeight: 700 }}>Sign in</Link>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword} style={{ padding: 0, boxShadow: 'none', border: 'none' }}>
            <h2>Reset Password</h2>
            <p className="auth-subtitle">
              Check your email <strong style={{ color: 'var(--color-orange-primary)' }}>{email}</strong> for the 6-digit OTP code.
            </p>

            {infoMessage && (
              <p style={{ color: "#1e40af", backgroundColor: "#dbeafe", padding: "10px 14px", borderRadius: "var(--radius-sm)", fontSize: "0.88rem", marginBottom: '1rem', border: '1px solid #bfdbfe' }}>
                {infoMessage}
              </p>
            )}
            {error && <p className="auth-error">{error}</p>}

            <div className="form-group" style={{ margin: "15px 0" }}>
              <label style={{ display: "block", fontWeight: "700", marginBottom: "6px", fontSize: '0.88rem' }}>
                6-Digit Reset Code
              </label>
              <input
                type="text"
                maxLength="6"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                style={{
                  fontSize: "24px",
                  letterSpacing: "8px",
                  textAlign: "center",
                  fontWeight: "bold",
                  padding: "10px",
                  borderRadius: "var(--radius-md)"
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

            <button type="submit" disabled={loading}>
              {loading ? "Resetting Password..." : "Reset Password & Login"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem", fontSize: "0.88rem" }}>
              <button
                type="button"
                onClick={handleRequestOtp}
                style={{ background: "none", border: "none", color: "var(--color-orange-primary)", cursor: "pointer", fontWeight: 600 }}
              >
                Resend Code
              </button>
              <Link to="/login" style={{ color: "var(--color-text-muted)" }}>
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
