// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    <h3>🏗️ Aditya Enterprises</h3>
                    <p>Build Today. Better Tomorrow.</p>
                    <p style={{ fontSize: '0.88rem' }}>
                        Your trusted supplier of premium raw construction materials, structural steel, OPC cement, and building supplies.
                    </p>
                </div>

                <div className="footer-col">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><Link to="/">Home Marketplace</Link></li>
                        <li><Link to="/cart">Shopping Cart</Link></li>
                        <li><Link to="/login">Customer Login</Link></li>
                        <li><Link to="/register">Create Account</Link></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Materials</h4>
                    <ul>
                        <li><span>Cement & Concrete</span></li>
                        <li><span>TMT Steel & Rebars</span></li>
                        <li><span>AAC Blocks & Bricks</span></li>
                        <li><span>Plumbing & Electrical</span></li>
                    </ul>
                </div>

                <div className="footer-col">
                    <h4>Contact Support</h4>
                    <ul>
                        <li><span>Email: adityaenterprisesofficial62@gmail.com</span></li>
                        <li><span>Phone: +91 7667489264</span></li>
                        <li><span>Location: Bihar • Uttar Pradesh • Jharkhand</span></li>
                    </ul>
                </div>
            </div>

            <div className="footer-bottom">
                <div>&copy; {new Date().getFullYear()} Aditya Enterprises E-Commerce. All rights reserved.</div>
                <div>Premium Construction Materials Marketplace</div>
            </div>
        </footer>
    );
};

export default Footer;