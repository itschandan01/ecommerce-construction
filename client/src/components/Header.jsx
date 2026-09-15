// // client/src/components/Header.jsx (Properly Merged)
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { useCart } from '../context/CartContext'; 

// const Header = () => {
//     // 1. Theme State & Logic
//     const [theme, setTheme] = useState(
//         localStorage.getItem("theme") || "dark"
//     );

//     useEffect(() => {
//         document.body.setAttribute("data-theme", theme);
//         localStorage.setItem("theme", theme);
//     }, [theme]);

//     const toggleTheme = () => {
//         setTheme(prev => (prev === "dark" ? "light" : "dark"));
//     };

//     // 2. Auth & Cart Hooks
//     const { user, logout } = useAuth();
//     const { getItemCount } = useCart(); 

//     const cartItemCount = getItemCount(); 

//     // 3. Frontend Owner Check
//     const OWNER_ID = 1; // Ensure this matches your backend owner ID
//     const isOwner = user && user.id === OWNER_ID; 

//     return (
//         <header className="header">
//             <div className="logo">
//                 <Link to="/">🏗️ AdityaEnterprises</Link>
//             </div>
            
//             <nav className="nav-links">
//                 {/* Theme Toggle Button */}
//                 <button className="theme-toggle" onClick={toggleTheme}>
//                     {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
//                 </button>

//                 <Link to="/">Home</Link>
                
//                 {/* Show Add Product link only if user is the owner */}
//                 {isOwner && <Link to="/add-product">Add Product</Link>} 
                
//                 <Link to="/cart">🛒 Cart ({cartItemCount})</Link> 
                
//                 {/* Auth Links / User Actions */}
//                 {user ? (
//                     <div className="header-user">
//                         <span>Hello, {user.name.split(' ')[0]}</span>
//                         <button onClick={logout} className="logout-button">Logout</button>
//                     </div>
//                 ) : (
//                     <>
//                         <Link to="/login">Login</Link>
//                         <Link to="/register">Register</Link>
//                     </>
//                 )}
//             </nav>
//         </header>
//     );
// };

// export default Header;


//after changes 
// client/src/components/Header.jsx (Properly Merged)
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext'; 

const Header = () => {
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

    // 3. Frontend Owner Check
    const OWNER_ID = 1; // Ensure this matches your backend owner ID
    const isOwner = user && user.id === OWNER_ID; 

    return (
        <header className="header">
            <div className="logo">
                <Link to="/">🏗️ AdityaEnterprises</Link>
            </div>
            
            <nav className="nav-links">
                {/* Theme Toggle Button */}
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
                </button>

                <Link to="/">Home</Link>
                
                {/* Owner-only links */}
                {isOwner && <Link to="/add-product">Add Product</Link>}
                {isOwner && <Link to="/admin/orders">View Orders</Link>}
                
                <Link to="/cart">🛒 Cart ({cartItemCount})</Link> 
                
                {/* Auth Links / User Actions */}
                {user ? (
                    <div className="header-user">
                        <span>Hello, {user.name.split(' ')[0]}</span>
                        <button onClick={logout} className="logout-button">
                            Logout
                        </button>
                    </div>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
};

export default Header;
