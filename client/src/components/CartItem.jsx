// client/src/components/CartItem.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { getProductUnit } from "../utils/productUnits";

const CartItem = ({ item }) => {
    const { updateQuantity, removeFromCart } = useCart();

    const handleQuantityChange = (e) => {
        const newQuantity = parseInt(e.target.value);
        if (newQuantity >= 1) {
            updateQuantity(item.id, newQuantity);
        }
    };
    
    // Get the specific unit for this product (e.g., 'bag', 'kg', 'piece')
    const unit = getProductUnit(item.name);
    
    // Ensure price is treated as a number
    const itemPrice = parseFloat(item.price);
    const itemSubtotal = (itemPrice * item.quantity).toFixed(2);

    return (
        <div className="cart-item">
            <img 
                src={item.image_url || 'https://via.placeholder.com/80'} 
                alt={item.name} 
                className="cart-item-image" 
            />
            <div className="item-details">
                <h4>{item.name}</h4>
                <p>
                    Unit Price: ₹{itemPrice.toFixed(2)} / {unit}
                </p>  
                <div className="quantity-controls">
                    {/* Added the unit label here as requested */}
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
                <p>Subtotal: ₹{itemSubtotal}</p>
            </div>
            
            <button 
                onClick={() => removeFromCart(item.id)} 
                className="remove-button"
            >
                &times; Remove
            </button>
        </div>
    );
};

export default CartItem;