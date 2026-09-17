// client/src/pages/CheckoutAddress.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CheckoutAddress() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    address_line: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      // Basic validation
      for (const key in form) {
        if (!form[key]) {
          alert("Please fill all address fields");
          return;
        }
      }

      setLoading(true);

      const res = await api.post("/addresses", form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLoading(false);

      navigate("/checkout/payment", {
        state: {
          addressId: res.data.id,
          total: state?.total,
        },
      });
    } catch (err) {
      setLoading(false);
      console.error("Address save failed:", err?.response?.data || err.message);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        alert("Failed to save address");
      }
    }
  };

  return (
    <>
      <Header />

      <div className="page-container">
        {/* Step Indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            1. Cart
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-orange-primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>
            2. Delivery Address
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            3. Payment
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            4. Confirmation
          </div>
        </div>

        <div className="checkout-card">
          <h2>📍 Delivery Address</h2>
          <p>Enter your site delivery details carefully for accurate material dispatch.</p>

          <div className="form-grid">
            <input
              placeholder="Full Name"
              value={form.full_name}
              onChange={(e) =>
                setForm({ ...form, full_name: e.target.value })
              }
            />
            <input
              placeholder="Phone Number (10 digits)"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
            <textarea
              placeholder="Complete Site / Street Address"
              rows={3}
              value={form.address_line}
              onChange={(e) =>
                setForm({ ...form, address_line: e.target.value })
              }
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
            />
            <input
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) =>
                setForm({ ...form, pincode: e.target.value })
              }
            />
          </div>

          <button className="checkout-button" onClick={submit} disabled={loading}>
            {loading ? "Saving Address..." : "Continue to Payment →"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
