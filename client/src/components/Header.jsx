// client/src/components/Header.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
    const location = useLocation();

    // 1. Theme State & Logic
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "dark"
    );

    useEffect(() => {
        document.body.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => (prev === "dark" ? "light" : "dark"));
    };

    // 2. Auth & Cart Hooks
    const { user, logout } = useAuth();
    const { getItemCount } = useCart();

    const cartItemCount = getItemCount();

    // 3. Frontend Admin Check
    const ADMIN_EMAIL = "adityaenterprisesofficial62@gmail.com";
    const isAdmin =
      user &&
      user.email &&
      user.email.toLowerCase().trim() === ADMIN_EMAIL;

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo">
                    <Link to="/">
                        <span>🏗️ Aditya Enterprises</span>
                    </Link>
                </div>

                <nav className="nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                        Home
                    </Link>
                    
                    {/* Admin-only links */}
                    {isAdmin && (
                        <Link to="/add-product" className={location.pathname === '/add-product' ? 'active' : ''}>
                            + Product
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>
                            Orders
                        </Link>
                    )}

                    <Link to="/cart" className={`cart-nav-link ${location.pathname === '/cart' ? 'active' : ''}`}>
                        🛒 Cart
                        <span className="cart-count-badge">{cartItemCount}</span>
                    </Link>

                    {/* Theme Toggle */}
                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                    </button>

                    {/* Auth Links / User Actions */}
                    {user ? (
                        <div className="header-user">
                            <span className="user-name-text">
                                Hello, {user.name ? user.name.split(' ')[0] : 'Customer'}
                            </span>
                            <button onClick={logout} className="logout-button">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
                                Login
                            </Link>
                            <Link to="/register" className={location.pathname === '/register' ? 'active' : ''}>
                                Register
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;
