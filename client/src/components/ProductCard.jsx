import React from "react";
import { useCart } from "../context/CartContext";
import { getProductUnit } from "../utils/productUnits";

const DEFAULT_CONSTRUCTION_IMAGE = "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=60";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const unit = getProductUnit(product.name);

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = DEFAULT_CONSTRUCTION_IMAGE;
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

        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock_quantity <= 0}
        >
          {product.stock_quantity > 0 ? "🛒 Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;