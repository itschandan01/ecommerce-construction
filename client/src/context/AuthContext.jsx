// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Base URL for the backend API
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;


export const AuthProvider = ({ children }) => {
    // Check local storage for initial token/user state
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Set Authorization header for all future requests
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);


    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token: newToken, user: userData } = response.data;
            
            // Store in state and local storage
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            setLoading(false);
            return false;
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            const { token: newToken, user: userDataResponse } = response.data;
            
            // Store in state and local storage
            setToken(newToken);
            setUser(userDataResponse);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userDataResponse));

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);