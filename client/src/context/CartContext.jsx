// // client/src/context/CartContext.jsx
// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from './AuthContext';

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState(
//         JSON.parse(localStorage.getItem('cartItems')) || []
//     );
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState(null);
//     const { token } = useAuth(); 

//     // Sync cart to local storage whenever cartItems changes
//     useEffect(() => {
//         localStorage.setItem('cartItems', JSON.stringify(cartItems));
//     }, [cartItems]);

//     // --- Core Cart Operations ---

//     const addToCart = (product, quantity = 1) => {
//         setCartItems(prevItems => {
//             const exists = prevItems.find(item => item.id === product.id);

//             if (exists) {
//                 // If product exists, update quantity
//                 return prevItems.map(item =>
//                     item.id === product.id
//                         ? { ...item, quantity: item.quantity + quantity }
//                         : item
//                 );
//             } else {
//                 // If new product, add it, ensuring price is numeric
//                 return [...prevItems, { 
//                     ...product, 
//                     quantity,
//                     price: parseFloat(product.price) // Ensure price is a number
//                 }];
//             }
//         });
//     };

//     const updateQuantity = (productId, newQuantity) => {
//         if (newQuantity <= 0) {
//             removeFromCart(productId);
//             return;
//         }
//         setCartItems(prevItems => 
//             prevItems.map(item =>
//                 item.id === productId ? { ...item, quantity: newQuantity } : item
//             )
//         );
//     };

//     const removeFromCart = (productId) => {
//         setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
//     };

//     const clearCart = () => {
//         setCartItems([]);
//     };

//     const getTotal = () => {
//         return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2);
//     };
    
//     const getItemCount = () => {
//         return cartItems.reduce((acc, item) => acc + item.quantity, 0);
//     };

//     // --- Checkout Operation ---

//     const checkout = async () => {
//         if (!token) {
//             setError('You must be logged in to checkout.');
//             return false;
//         }
//         if (cartItems.length === 0) {
//             setError('Your cart is empty.');
//             return false;
//         }

//         setLoading(true);
//         setError(null);
        
//         try {
//             const orderData = {
//                 items: cartItems.map(item => ({
//                     productId: item.id,
//                     quantity: item.quantity,
//                     price: item.price,
//                     name: item.name // Added for better server logs/error handling
//                 })),
//                 totalAmount: getTotal(),
//             };
            
//             const response = await axios.post(
//   `${import.meta.env.VITE_API_BASE_URL}/api/orders/checkout`,
//   orderData,
//   {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   }
// );


//             if (response.status === 200) {
//                 clearCart();
//                 setLoading(false);
//                 return response.data; // Confirmation details
//             }

//         } catch (err) {
//             // Use the specific error message from the backend (e.g., stock error)
//             setError(err.response?.data?.error || 'Checkout failed due to a server error.');
//             setLoading(false);
//             return false;
//         }
//     };

//     return (
//         <CartContext.Provider 
//             value={{ 
//                 cartItems, 
//                 loading, 
//                 error, 
//                 addToCart, 
//                 updateQuantity, 
//                 removeFromCart, 
//                 clearCart, 
//                 getTotal,
//                 getItemCount,
//                 checkout 
//             }}
//         >
//             {children}
//         </CartContext.Provider>
//     );
// };

// export const useCart = () => useContext(CartContext);

// client/src/context/CartContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

/**
 * Cart Context
 * Handles cart state, persistence, and helpers
 */
const CartContext = createContext();

const ADMIN_EMAIL = "adityaenterprisesofficial62@gmail.com";

const getCartKey = (user) => {
  if (!user || !user.email) {
    return "cartItems_guest";
  }
  const email = user.email.toLowerCase().trim();
  if (email === ADMIN_EMAIL) {
    return null; // Admin has no cart storage key
  }
  return `cartItems_${email}`;
};

export const CartProvider = ({ children }) => {
  const { user, token } = useAuth();
  const targetKey = getCartKey(user);
  const isAdmin = !targetKey;

  // -----------------------------
  // State & Active Key Tracking
  // -----------------------------
  const [cartItems, setCartItems] = useState(() => {
    if (!targetKey) return [];
    try {
      const stored = localStorage.getItem(targetKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loaded key reference to guard against stale cart rendering
  const loadedKeyRef = useRef(targetKey);

  // Synchronize cart state on auth/user change (hydration only, no writing)
  useEffect(() => {
    loadedKeyRef.current = targetKey;
    if (!targetKey) {
      setCartItems([]);
      return;
    }

    try {
      const stored = localStorage.getItem(targetKey);
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
  }, [targetKey]);

  // Derived effective cart items:
  // Evaluates immediately to [] for Admin or when targetKey has not hydrated yet.
  const effectiveItems =
    isAdmin || loadedKeyRef.current !== targetKey ? [] : cartItems;

  // -----------------------------
  // Cart Operations (Action-Based Persistence)
  // -----------------------------
  const addToCart = (product, quantity = 1) => {
    if (isAdmin || !targetKey) return; // Admin cannot add to cart

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      let updated;

      if (existing) {
        updated = prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [
          ...prev,
          {
            ...product,
            quantity,
            price: Number(product.price),
          },
        ];
      }

      try {
        localStorage.setItem(targetKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist cart:", e);
      }

      return updated;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (isAdmin || !targetKey) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );

      try {
        localStorage.setItem(targetKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist cart:", e);
      }

      return updated;
    });
  };

  const removeFromCart = (productId) => {
    if (isAdmin || !targetKey) return;

    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== productId);

      try {
        localStorage.setItem(targetKey, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to persist cart:", e);
      }

      return updated;
    });
  };

  /**
   * Clears cart completely
   */
  const clearCart = () => {
    setCartItems([]);
    if (targetKey) {
      try {
        localStorage.removeItem(targetKey);
      } catch (e) {
        console.error("Failed to clear cart storage:", e);
      }
    }
  };

  // -----------------------------
  // Helpers
  // -----------------------------
  const getTotal = () => {
    return effectiveItems
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
  };

  const getItemCount = () => {
    return effectiveItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // -----------------------------
  // OPTIONAL: Old direct checkout
  // -----------------------------
  const checkout = async () => {
    if (!token) {
      setError("You must be logged in to checkout.");
      return false;
    }

    if (effectiveItems.length === 0) {
      setError("Your cart is empty.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        items: effectiveItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getTotal(),
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/orders/checkout`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      clearCart();
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(
        err.response?.data?.error || "Checkout failed due to server error."
      );
      setLoading(false);
      return false;
    }
  };

  // -----------------------------
  // Context Value
  // -----------------------------
  return (
    <CartContext.Provider
      value={{
        cartItems: effectiveItems,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getItemCount,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// -----------------------------
// Hook
// -----------------------------
export const useCart = () => useContext(CartContext);
