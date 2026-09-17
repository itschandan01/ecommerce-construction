import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

const safeFormatDate = (rawDate) => {
  if (!rawDate) {
    return new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) {
    return new Date().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    });
  }
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!state) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="checkout-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
            <h2>No active order session found.</h2>
            <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
              Explore our catalog to place a new construction material order.
            </p>
            <button className="checkout-button" onClick={() => navigate("/")} style={{ marginTop: "1.5rem" }}>
              Explore Marketplace
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const {
    orderId,
    paymentMethod,
    totalAmount,
    subtotal: stateSubtotal,
    shipping: stateShipping,
    items = [],
    address,
    created_at,
  } = state;

  const isOnline = paymentMethod === "razorpay";
  const orderDateStr = safeFormatDate(created_at);

  const customerName = address?.full_name || user?.name || "Customer";
  const customerPhone = address?.phone || user?.phone || "N/A";
  const customerEmail = user?.email || "Email on file";

  const addressLineText = address
    ? [address.address_line || address.street_address, address.city, address.state, address.pincode ? `Pincode: ${address.pincode}` : null].filter(Boolean).join(", ")
    : "Delivery site on file";

  // Calculate items subtotal and shipping
  const calculatedSubtotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );
  const subtotal = stateSubtotal !== undefined ? Number(stateSubtotal) : calculatedSubtotal;
  const isFreeShipping = subtotal >= 1000;
  const shipping = stateShipping !== undefined ? Number(stateShipping) : (isFreeShipping ? 0 : 50);
  const finalTotal = totalAmount !== undefined ? Number(totalAmount) : (subtotal + shipping);

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

        <div className="order-receipt-wrapper" style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Top Banner */}
          <div style={{ textAlign: "center", marginBottom: "28px", background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "28px" }}>
            <div style={{ fontSize: "52px", lineHeight: "1" }}>🎉</div>
            <h2 style={{ color: "var(--color-success)", fontSize: "28px", marginTop: "12px", fontWeight: "800" }}>
              ✓ Order Successfully Placed
            </h2>
            <p style={{ color: "var(--color-text-muted)", marginTop: "6px", fontSize: "0.95rem" }}>
              Thank you for ordering with <strong>Aditya Enterprises</strong>. A receipt email has been dispatched.
            </p>
          </div>

          {/* Section 1: ORDER INFORMATION */}
          <div className="receipt-section-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-orange-primary)", borderBottom: "2px solid var(--color-orange-primary)", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" }}>
              📋 Order Information
            </h3>
            <table className="receipt-info-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)", width: "40%" }}><strong>Order ID:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "700", color: "var(--color-text-main)" }}>#{orderId}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)" }}><strong>Order Date:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "600", color: "var(--color-text-main)" }}>{orderDateStr}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)" }}><strong>Payment Method:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "700", color: isOnline ? "var(--color-orange-primary)" : "var(--color-warning)" }}>
                    {isOnline ? "Pay Online (Razorpay) - PAID" : "Cash on Delivery (COD) - PENDING"}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)" }}><strong>Order Status:</strong></td>
                  <td style={{ padding: "8px 0" }}>
                    <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "12px", fontWeight: "700", fontSize: "0.85rem" }}>
                      CONFIRMED
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: CUSTOMER INFORMATION */}
          <div className="receipt-section-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-orange-primary)", borderBottom: "2px solid var(--color-orange-primary)", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" }}>
              👤 Customer Information
            </h3>
            <table className="receipt-info-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)", width: "40%" }}><strong>Customer Name:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "600", color: "var(--color-text-main)" }}>{customerName}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)" }}><strong>Phone Number:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "600", color: "var(--color-text-main)" }}>{customerPhone}</td>
                </tr>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)" }}><strong>Email Address:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "600", color: "var(--color-text-main)" }}>{customerEmail}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: DELIVERY INFORMATION */}
          <div className="receipt-section-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-orange-primary)", borderBottom: "2px solid var(--color-orange-primary)", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" }}>
              📍 Delivery Information
            </h3>
            <table className="receipt-info-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "8px 0", color: "var(--color-text-muted)", width: "40%" }}><strong>Delivery Address:</strong></td>
                  <td style={{ padding: "8px 0", fontWeight: "600", color: "var(--color-text-main)", lineHeight: "1.5" }}>{addressLineText}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: ORDER ITEMS */}
          <div className="receipt-section-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-orange-primary)", borderBottom: "2px solid var(--color-orange-primary)", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" }}>
              📦 Ordered Items ({items.length})
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
                <thead>
                  <tr style={{ background: "var(--color-bg-light)", color: "var(--color-text-muted)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Product</th>
                    <th style={{ padding: "10px 14px", textAlign: "center" }}>Qty</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Unit Price</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = item.quantity || 1;
                    const price = Number(item.price || 0);
                    const itemTotal = price * qty;
                    return (
                      <tr key={idx} style={{ borderBottom: "1px solid var(--color-slate-border)" }}>
                        <td style={{ padding: "12px 14px", fontWeight: "600", color: "var(--color-text-main)" }}>
                          {item.name || item.title || `Product #${item.id || idx + 1}`}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "center", color: "var(--color-text-muted)" }}>
                          {qty}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", color: "var(--color-text-muted)" }}>
                          ₹{price.toFixed(2)}
                        </td>
                        <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "700", color: "var(--color-orange-primary)" }}>
                          ₹{itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 5: ORDER SUMMARY */}
          <div className="receipt-section-card" style={{ background: "var(--color-bg-card)", border: "1px solid var(--color-slate-border)", borderRadius: "var(--radius-lg)", padding: "24px", marginBottom: "24px" }}>
            <h3 style={{ fontSize: "1.1rem", color: "var(--color-orange-primary)", borderBottom: "2px solid var(--color-orange-primary)", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" }}>
              💳 Order Summary
            </h3>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Subtotal:</span>
              <span style={{ fontWeight: "600", color: "var(--color-text-main)" }}>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Shipping / Freight:</span>
              <span style={{ fontWeight: "700", color: shipping === 0 ? "var(--color-success)" : "var(--color-text-main)" }}>
                {shipping === 0 ? "FREE (Orders ≥ ₹1,000)" : `₹${shipping.toFixed(2)}`}
              </span>
            </div>
            <div style={{ borderTop: "2px solid var(--color-slate-border)", paddingTop: "12px", marginTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: "800" }}>
              <span>Total Amount:</span>
              <span style={{ color: "var(--color-orange-primary)" }}>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              className="checkout-button"
              onClick={() => navigate("/")}
              style={{ padding: "14px 36px", fontSize: "1rem", fontWeight: "700" }}
            >
              Continue Shopping →
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
