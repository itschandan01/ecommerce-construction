import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

/* Load Razorpay safely */
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const CheckoutPayment = () => {
  const { cartItems, clearCart } = useCart();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [loading, setLoading] = useState(false);

  if (!state?.total || !state?.addressId) {
    return (
      <>
        <Header />
        <div className="page-container">
          <div className="checkout-card" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--color-error)', fontWeight: 600 }}>Invalid checkout session.</p>
            <button className="checkout-button" onClick={() => navigate('/cart')} style={{ marginTop: '1rem' }}>
              Return to Cart
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const token = localStorage.getItem("token");

  const createOrder = async (method) => {
    if (!token) throw new Error("AUTH_MISSING");

    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    const res = await api.post(
      "/orders/place",
      {
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: Number(state.total),
        addressId: state.addressId,
        paymentMethod: method,
        userEmail: storedUser.email || "",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data.orderId;
  };

  const handleCOD = async () => {
    const orderedItems = [...cartItems];
    const orderId = await createOrder("cod");

    clearCart();
    navigate("/order-confirmation", {
      state: {
        orderId,
        paymentMethod: "cod",
        totalAmount: state.total,
        items: orderedItems,
      },
    });
  };

  const handleRazorpay = async () => {
    const orderedItems = [...cartItems];
    const orderId = await createOrder("razorpay");

    const rpOrder = await api.post(
      "/payment/create",
      { amount: state.total, orderId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("RAZORPAY_LOAD_FAILED");

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY;
    if (!razorpayKey) {
      throw new Error("Razorpay Key ID (VITE_RAZORPAY_KEY) is not configured.");
    }

    new window.Razorpay({
      key: razorpayKey,
      amount: rpOrder.data.amount,
      currency: "INR",
      name: "Aditya Enterprises",
      description: "Construction Order Payment",
      order_id: rpOrder.data.id,
      handler: async (response) => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        await api.post(
          "/payment/verify",
          {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
            items: orderedItems.map((item) => ({
              productId: item.id,
              name: item.name,
              quantity: item.quantity,
              price: item.price,
            })),
            totalAmount: Number(state.total),
            userEmail: storedUser.email || "",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        clearCart();
        navigate("/order-confirmation", {
          state: {
            orderId,
            paymentMethod: "razorpay",
            totalAmount: state.total,
            items: orderedItems,
          },
        });
      },
      theme: { color: "#f97316" },
    }).open();
  };

  const handlePay = async () => {
    if (!cartItems.length) return alert("Cart is empty");

    try {
      setLoading(true);
      paymentMethod === "cod"
        ? await handleCOD()
        : await handleRazorpay();
    } catch (err) {
      console.error("Checkout error:", err);

      if (err.message === "AUTH_MISSING") {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else {
        const errorMsg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err.message ||
          "Payment failed. Please try again.";
        alert(`Payment error: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
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
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            2. Delivery Address
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-orange-primary)', color: '#fff', fontSize: '0.82rem', fontWeight: 700 }}>
            3. Payment
          </div>
          <div style={{ padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>
            4. Confirmation
          </div>
        </div>

        <div className="checkout-card">
          <h2>💳 Payment Method</h2>
          <p>Select your preferred payment gateway for order completion.</p>

          <div style={{ background: 'var(--color-orange-light)', border: '1px solid var(--color-orange-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>Total Amount Payable:</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-orange-primary)' }}>₹{state.total}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'razorpay' ? 'rgba(249, 115, 22, 0.08)' : 'transparent', borderColor: paymentMethod === 'razorpay' ? 'var(--color-orange-primary)' : 'var(--color-slate-border)' }}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
                style={{ accentColor: 'var(--color-orange-primary)', width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.98rem' }}>Pay Online (Razorpay)</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>UPI, Credit/Debit Card, Netbanking, Wallets</span>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === 'cod' ? 'rgba(249, 115, 22, 0.08)' : 'transparent', borderColor: paymentMethod === 'cod' ? 'var(--color-orange-primary)' : 'var(--color-slate-border)' }}>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
                style={{ accentColor: 'var(--color-orange-primary)', width: '18px', height: '18px' }}
              />
              <div>
                <strong style={{ display: 'block', fontSize: '0.98rem' }}>Cash on Delivery (COD)</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Pay cash upon material arrival at delivery site</span>
              </div>
            </label>
          </div>

          <button
            className="checkout-button"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? "Processing Order..." : `Place Order (₹${state.total})`}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPayment;
