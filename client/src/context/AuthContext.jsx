// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            
            setToken(newToken);
            setUser(userData);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            setLoading(false);
            throw err;
        }
    };

    const sendSignupOtp = async (email, name) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/send-otp`, { email, name });
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP');
            setLoading(false);
            throw err;
        }
    };

    const register = async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            const { token: newToken, user: userDataResponse } = response.data;
            
            setToken(newToken);
            setUser(userDataResponse);
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userDataResponse));

            setLoading(false);
            return true;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            setLoading(false);
            throw err;
        }
    };

    const requestForgotPasswordOtp = async (email) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
            setLoading(false);
            throw err;
        }
    };

    const resetPasswordWithOtp = async (email, otp, newPassword) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/reset-password`, { email, otp, newPassword });
            setLoading(false);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider 
            value={{ 
                user, 
                token, 
                loading, 
                error, 
                login, 
                sendSignupOtp, 
                register, 
                requestForgotPasswordOtp, 
                resetPasswordWithOtp, 
                logout 
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);