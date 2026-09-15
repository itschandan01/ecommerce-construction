import React from "react";
import { useCart } from "../context/CartContext";
import { getProductUnit } from "../utils/productUnits";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const unit = getProductUnit(product.name);

  return (
    <div className="product-card">
      {/* Stock Badges Logic */}
      <div className="badge-container">
        {product.stock_quantity < 50 && product.stock_quantity > 0 && (
          <span className="stock-badge low">Low Stock</span>
        )}

        {product.stock_quantity >= 500 && (
          <span className="stock-badge bulk">Bulk Available</span>
        )}
      </div>

      <img
        src={product.image_url || "https://via.placeholder.com/300"}
        alt={product.name}
        className="product-image"
      />

      <div className="product-info">
        <h3>{product.name}</h3>

        <div className="product-price">
          ₹{parseFloat(product.price).toFixed(2)}
          <span className="unit-text"> / {unit}</span>
        </div>

        <p className="stock-info">
          Available: {product.stock_quantity} {unit}
        </p>

        <button
          onClick={() => addToCart(product, 1)}
          disabled={product.stock_quantity <= 0}
        >
          {product.stock_quantity > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;