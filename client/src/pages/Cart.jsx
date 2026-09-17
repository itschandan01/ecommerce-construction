// client/src/pages/Cart.jsx
import React from 'react';
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

    // Section 10: Logged-out user route protection
    if (!user) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <div className="empty-cart-box" style={{ maxWidth: '520px', margin: '4rem auto', padding: '3rem 2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔒</div>
                        <h2 style={{ fontSize: '1.6rem', color: 'var(--color-text-main)', marginBottom: '0.5rem', fontWeight: '800' }}>Login Required</h2>
                        <p className="empty-cart" style={{ marginBottom: '1.8rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
                            Please login to your account to view your cart and proceed with checkout.
                        </p>
                        <button className="shop-now-btn" onClick={() => navigate('/login')} style={{ width: '100%', padding: '14px', fontSize: '1rem', fontWeight: '700' }}>
                            Login to Account
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    // Calculate totals based on Business Rule: Subtotal >= ₹1,000 -> Free Shipping
    const subtotal = parseFloat(getTotal()) || 0; 
    const isFreeShipping = subtotal >= 1000;
    const shipping = isFreeShipping ? 0 : 50.00; 
    const finalTotal = (subtotal + shipping).toFixed(2);

    const handleCheckout = () => {
        // Move to the next step in the funnel
        navigate('/checkout/address', {
            state: {
                subtotal,
                shipping,
                total: finalTotal
            }
        });
    };

    // Render empty cart state for logged-in user
    if (cartItems.length === 0) {
        return (
            <>
                <Header />
                <div className="cart-container">
                    <h2 className="cart-title">Your Construction Cart</h2>
                    <div className="empty-cart-box">
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                        <p className="empty-cart">Your cart is empty. Ready to build your project?</p>
                        <button className="shop-now-btn" onClick={() => navigate('/')}>
                            Explore Materials Marketplace
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
                <h2 className="cart-title">Your Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</h2>
                
                <div className="cart-content">
                    {/* LEFT COLUMN: List of Items */}
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <CartItem key={item.id} item={item} />
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Order Summary Card */}
                    <div className="cart-summary">
                        <h3>Order Summary</h3>
                        
                        <div className="summary-line">
                            <span>Subtotal:</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        
                        <div className="summary-line">
                            <span>Estimated Freight / Shipping:</span>
                            <span style={{ color: isFreeShipping ? 'var(--color-success)' : 'inherit', fontWeight: isFreeShipping ? 700 : 'normal' }}>
                                {isFreeShipping ? 'FREE' : `₹${shipping.toFixed(2)}`}
                            </span>
                        </div>

                        {isFreeShipping ? (
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-success)', marginTop: '-8px', marginBottom: '10px', fontWeight: 600 }}>
                                ✓ Eligible for FREE Freight Shipping (Orders ≥ ₹1,000)
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '-8px', marginBottom: '10px' }}>
                                Add ₹{(1000 - subtotal).toFixed(2)} more for FREE Freight Shipping!
                            </div>
                        )}
                        
                        <hr className="summary-divider" />
                        
                        <div className="summary-line total-line">
                            <span>Total Amount:</span>
                            <span className="total-amount">₹{finalTotal}</span>
                        </div>

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