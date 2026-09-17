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
          <div className="checkout-card" style={{ textAlign: "center" }}>
            <h2>No active order session found.</h2>
            <button className="checkout-button" onClick={() => navigate("/")} style={{ marginTop: "1rem" }}>
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
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            1. Cart
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            2. Delivery Address
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            3. Payment
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-orange-primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>
            4. Confirmation
          </div>
        </div>

        <div
          className="checkout-card order-success-card"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <span style={{ fontSize: "52px" }}>🎉</span>
            <h2 style={{ color: "var(--color-success)", fontSize: "28px", marginTop: "10px" }}>
              Order Placed Successfully!
            </h2>
            <div
              style={{
                display: "inline-block",
                background: "rgba(16, 185, 129, 0.15)",
                color: "var(--color-success)",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "14px",
                fontWeight: "600",
                marginTop: "10px",
                border: "1px solid rgba(16, 185, 129, 0.3)",
              }}
            >
              📧 A confirmation email with order details has been sent to your registered email!
            </div>
          </div>

          {/* Order Details Summary Box */}
          <div
            style={{
              background: "var(--color-bg-light)",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "24px",
              border: "1px solid var(--color-slate-border)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
                fontSize: "15px",
              }}
            >
              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Order Reference:</span>
                <div style={{ fontWeight: "bold", color: "var(--color-text-main)", fontSize: "17px" }}>
                  #{orderId}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Payment Method:</span>
                <div style={{ fontWeight: "bold", color: isOnline ? "var(--color-orange-primary)" : "var(--color-warning)" }}>
                  {isOnline ? "Online Payment (Razorpay)" : "Cash on Delivery (COD)"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Payment Status:</span>
                <div style={{ fontWeight: "700", color: isOnline ? "var(--color-success)" : "var(--color-warning)" }}>
                  {isOnline ? "PAID ✅" : "PENDING (Pay on Delivery) 🚚"}
                </div>
              </div>

              <div>
                <span style={{ color: "var(--color-text-muted)", fontSize: "0.85rem" }}>Total Order Value:</span>
                <div style={{ fontWeight: "bold", color: "var(--color-orange-primary)", fontSize: "18px" }}>
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
                  color: "var(--color-text-main)",
                  borderBottom: "1px solid var(--color-slate-border)",
                  paddingBottom: "10px",
                  marginBottom: "16px",
                  fontWeight: "700",
                }}
              >
                Ordered Materials ({items.length})
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
                    <tr style={{ background: "var(--color-bg-light)", color: "var(--color-text-muted)" }}>
                      <th style={{ padding: "12px", borderRadius: "6px 0 0 6px" }}>Material Name</th>
                      <th style={{ padding: "12px", textAlign: "center" }}>Qty</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Unit Price</th>
                      <th style={{ padding: "12px", textAlign: "right", borderRadius: "0 6px 6px 0" }}>Total</th>
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
                            borderBottom: "1px solid var(--color-slate-border)",
                          }}
                        >
                          <td style={{ padding: "12px", color: "var(--color-text-main)", fontWeight: "600" }}>
                            {item.name || item.title || `Product #${item.id || idx + 1}`}
                          </td>
                          <td style={{ padding: "12px", textAlign: "center", color: "var(--color-text-muted)" }}>
                            {qty}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "var(--color-text-muted)" }}>
                            ₹{price.toFixed(2)}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", color: "var(--color-orange-primary)", fontWeight: "bold" }}>
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
                padding: "14px 32px",
                fontSize: "16px",
                fontWeight: "700",
                borderRadius: "var(--radius-md)",
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
