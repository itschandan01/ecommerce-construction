// client/src/pages/Cart.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer'; 
import CartItem from '../components/CartItem';
import '../App.css'; 

const Cart = () => {
    const { cartItems, getTotal } = useCart(); 
    const { user } = useAuth();
    const navigate = useNavigate();

    // Calculate totals
    const subtotal = parseFloat(getTotal()) || 0; 
    const shipping = 50.00; // Fixed shipping cost
    const finalTotal = (subtotal + shipping).toFixed(2);

    /**
     * UPDATED: handleCheckout
     * Redirects to the address step and passes order totals via router state.
     */
    const handleCheckout = () => {
        if (!user) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        // Move to the next step in the funnel
        navigate('/checkout/address', {
            state: {
                subtotal,
                shipping,
                total: finalTotal
            }
        });
    };

    // Render empty cart state
    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <h2 className="cart-title">Your Shopping Cart</h2>
                    <div className="empty-cart-box">
                        <p className="empty-cart">Your cart is empty. Time to start building!</p>
                        <button className="shop-now-btn" onClick={() => navigate('/')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
                <Footer /> 
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="cart-container">
                <h2 className="cart-title">Your Shopping Cart ({cartItems.length} items)</h2>
                
                <div className="cart-content">
                    {/* LEFT COLUMN: List of Items */}
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Summary Card */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-line">
                            <span>Shipping:</span>
                            <span>₹{shipping.toFixed(2)}</span>
                        </div>
                        
                        <hr className="summary-divider" />
                        
                        <div className="summary-line total-line" style={{ fontWeight: 'bold' }}>
                            <span>Total:</span>
                            <span className="total-amount">₹{finalTotal}</span>
                        </div>

                        {!user && (
                            <p className="login-prompt">
                                * Please log in to complete your order.
                            </p>
                        )}
                        
                        <button 
                            className="checkout-button"
                            onClick={handleCheckout}
                            disabled={cartItems.length === 0}
                        >
                            Proceed to Address (₹{finalTotal})
                        </button>
                    </div>
                </div>
            </div>
            <Footer /> 
        </>
    );
};

export default Cart;