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
          <div className="checkout-card">
            <p>Invalid checkout session</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const token = localStorage.getItem("token");

  const createOrder = async (method) => {
    if (!token) throw new Error("AUTH_MISSING");

    const res = await api.post(
      "/orders/place",
      {
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: Number(state.total),
        addressId: state.addressId,
        paymentMethod: method,
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
    const orderId = await createOrder("cod");

    clearCart();
    navigate("/order-confirmation", {
      state: { orderId, paymentMethod: "cod", totalAmount: state.total },
    });
  };

  const handleRazorpay = async () => {
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
    if (!razorpayKey) throw new Error("RAZORPAY_KEY_MISSING");

    new window.Razorpay({
      key: razorpayKey,
      amount: rpOrder.data.amount,
      currency: "INR",
      name: "Aditya Enterprises",
      description: "Construction Order Payment",
      order_id: rpOrder.data.id,
      handler: async (response) => {
        await api.post(
          "/payment/verify",
          {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            orderId,
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
          },
        });
      },
      theme: { color: "#1c4fd8" },
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
        alert("Payment failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="page-container">
        <div className="checkout-card">
          <h2>Checkout Payment</h2>

          <div className="total-box">
            Total Payable: ₹{state.total}
          </div>

          <div className="payment-methods">
            <label>
              <input
                type="radio"
                checked={paymentMethod === "razorpay"}
                onChange={() => setPaymentMethod("razorpay")}
              />
              Pay Online (Razorpay)
            </label>

            <label>
              <input
                type="radio"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>

          <button
            className="checkout-button"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default CheckoutPayment;
