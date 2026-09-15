import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return null;

  return (
    <>
      <Header />

      <div className="page-container">
        <div className="checkout-card order-success">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Order ID: <strong>{state.orderId}</strong></p>
          <p>Payment Method: <strong>{state.paymentMethod}</strong></p>
          <p>Total Paid: ₹{state.totalAmount}</p>

          <button
            className="checkout-button"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <Footer />
    </>
  );
}
