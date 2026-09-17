import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getProductUnit } from "../utils/productUnits";

const DEFAULT_CONSTRUCTION_IMAGE =
  "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=60";
const ADMIN_EMAIL = "adityaenterprisesofficial62@gmail.com";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const unit = getProductUnit(product.name);

  // Check if current user is Admin strictly via email
  const isAdmin = Boolean(
    user?.email && user.email.toLowerCase().trim() === ADMIN_EMAIL
  );

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_CONSTRUCTION_IMAGE;
  };

  const handleAddToCart = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (isAdmin) {
      return; // Admin cannot add to cart
    }

    addToCart(product, 1);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2000);
  };

  return (
    <div className="product-card">
      {/* Stock Badges */}
      <div className="badge-container">
        {product.stock_quantity < 50 && product.stock_quantity > 0 && (
          <span className="stock-badge low">Low Stock</span>
        )}

        {product.stock_quantity >= 500 && (
          <span className="stock-badge bulk">Bulk Available</span>
        )}
      </div>

      <div className="product-image-wrap">
        <img
          src={product.image_url || DEFAULT_CONSTRUCTION_IMAGE}
          alt={product.name}
          className="product-image"
          onError={handleImageError}
        />
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>

        <div>
          <div className="product-price">
            ₹{parseFloat(product.price).toFixed(2)}
            <span className="unit-text"> / {unit}</span>
          </div>

          <p className="stock-info">
            Available Stock: <strong>{product.stock_quantity}</strong> {unit}
          </p>
        </div>

        {/* Section 4: Admin MUST NOT have Add to Cart */}
        {!isAdmin ? (
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity <= 0}
            className={`add-to-cart-btn ${addedToast ? "added" : ""}`}
          >
            {addedToast
              ? "✓ Added to Cart"
              : product.stock_quantity > 0
              ? "🛒 Add to Cart"
              : "Out of Stock"}
          </button>
        ) : (
          <div
            className="admin-view-tag"
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "var(--color-slate-medium)",
              padding: "10px 0",
              fontWeight: "600",
              background: "var(--color-bg-light)",
              borderRadius: "var(--radius-md)",
              border: "1px dashed var(--color-slate-border)",
            }}
          >
            🔒 Admin View (No Cart Actions)
          </div>
        )}
      </div>

      {/* Section 6: Guest Login Required Modal */}
      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔒 Login Required</h3>
              <button
                className="modal-close"
                onClick={() => setShowLoginModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p>
                Please login to your account before adding products to your
                cart.
              </p>
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setShowLoginModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;