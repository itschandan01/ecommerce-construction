import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="checkout-card order-success">
            <h2>No active order session found.</h2>
            <button className="checkout-button" onClick={() => navigate("/")}>
              Back to Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const { orderId, paymentMethod, totalAmount, items = [] } = state;
  const isOnline = paymentMethod === "razorpay";

  return (
    <>
      <Header />

      <div className="page-container" style={{ padding: "40px 20px" }}>
        <div
          className="checkout-card order-success-card"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            background: "#161d2a",
            borderRadius: "16px",
            padding: "36px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            border: "1px solid #2d3748",
            color: "#e2e8f0",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "48px" }}>🎉</span>
            <h2 style={{ color: "#48bb78", fontSize: "28px", marginTop: "10px" }}>
              Order Placed Successfully!
            </h2>
            <div
              style={{
                display: "inline-block",
                background: "rgba(72, 187, 120, 0.15)",
                color: "#48bb78",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                marginTop: "10px",
                border: "1px solid rgba(72, 187, 120, 0.3)",
              }}
            >
              📧 A confirmation email with item details has been sent to your registered email!
            </div>
          </div>

          {/* Order Details Header */}
          <div
            style={{
              background: "#0f172a",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid #1e293b",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                fontSize: "15px",
              }}
            >
              <div>
                <span style={{ color: "#94a3b8" }}>Order ID:</span>
                <div style={{ fontWeight: "bold", color: "#f8fafc", fontSize: "16px" }}>
                  #{orderId}
                </div>
              </div>

              <div>
                <span style={{ color: "#94a3b8" }}>Payment Type:</span>
                <div style={{ fontWeight: "bold", color: isOnline ? "#38bdf8" : "#f59e0b" }}>
                  {isOnline ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
                </div>
              </div>

              <div>
                <span style={{ color: "#94a3b8" }}>Payment Status:</span>
                <div style={{ fontWeight: "600", color: isOnline ? "#48bb78" : "#f59e0b" }}>
                  {isOnline ? "PAID ✅" : "PENDING (Pay on Delivery) 🚚"}
                </div>
              </div>

              <div>
                <span style={{ color: "#94a3b8" }}>Total Amount Paid:</span>
                <div style={{ fontWeight: "bold", color: "#38bdf8", fontSize: "18px" }}>
                  ₹{Number(totalAmount).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div style={{ marginBottom: "28px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  color: "#cbd5e1",
                  borderBottom: "1px solid #334155",
                  paddingBottom: "10px",
                  marginBottom: "16px",
                }}
              >
                Ordered Items ({items.length})
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "14px",
                    textAlign: "left",
                  }}
                >
                  <thead>
                    <tr style={{ background: "#1e293b", color: "#94a3b8" }}>
                      <th style={{ padding: "12px" }}>Product Name</th>
                      <th style={{ padding: "12px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Unit Price</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => {
                      const qty = item.quantity || 1;
                      const price = Number(item.price || 0);
                      const subtotal = price * qty;
                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: "1px solid #1e293b",
                          }}
                        >
                          <td style={{ padding: "12px", color: "#f8fafc", fontWeight: "500" }}>
                            {item.name || item.title || `Product #${item.id || idx + 1}`}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "#cbd5e1" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#cbd5e1" }}>
                            ₹{price.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "#38bdf8", fontWeight: "bold" }}>
                            ₹{subtotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              className="checkout-button"
              onClick={() => navigate("/")}
              style={{
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#ffffff",
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "600",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
