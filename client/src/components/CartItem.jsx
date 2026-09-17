// client/src/components/CartItem.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { getProductUnit } from "../utils/productUnits";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=60";

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value, 10);
        if (newQuantity >= 1) {
            updateQuantity(item.id, newQuantity);
        }
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_IMAGE;
    };
    
    // Get the specific unit for this product
    const unit = getProductUnit(item.name);
    
    // Ensure price is treated as a number
    const itemPrice = parseFloat(item.price) || 0;
    const itemSubtotal = (itemPrice * item.quantity).toFixed(2);

    return (
        <div className="cart-item">
            <img 
                src={item.image_url || DEFAULT_IMAGE} 
                alt={item.name} 
                className="cart-item-image"
                onError={handleImageError}
            />
            <div className="item-details">
                <h4>{item.name}</h4>
                <p>
                    Unit Price: ₹{itemPrice.toFixed(2)} / {unit}
                </p>  
                <div className="quantity-controls">
                    <label htmlFor={`quantity-${item.id}`}>Quantity ({unit}):</label>
                    <input 
                        id={`quantity-${item.id}`}
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={handleQuantityChange}
                        className="quantity-input"
                    />
                </div>
            </div>
            
            <div className="item-subtotal">
                <p>₹{itemSubtotal}</p>
            </div>
            
            <button 
                onClick={() => removeFromCart(item.id)} 
                className="remove-button"
                title="Remove item"
            >
                ✕ Remove
            </button>
        </div>
    );
};

export default CartItem;