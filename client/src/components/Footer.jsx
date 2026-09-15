// client/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    // You should add styling for the 'footer' class to App.css
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <h3>AdityaEnterprises</h3>
                    <p>Your reliable source for high-quality construction materials. Building the future, one material at a time.</p>
                </div>
                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        {/* You would add an Inquiry/Contact page here */}
                        <li><Link to="/inquiry">Contact/Inquiry</Link></li> 
                        <li><Link to="/terms">Terms of Service</Link></li>
                    </ul>
                </div>
                <div className="footer-section contact">
                    <h3>Contact Us</h3>
                    <p>Email: adityaenterprisesofficial62@gmail.com</p>
                    <p>Phone: +91 7667489264</p>
                </div>
            </div>
            <div className="footer-bottom">
                &copy; {new Date().getFullYear()}AdityaEnterprises E-commerce. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;