// client/src/pages/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CategoryNav from '../components/CategoryNav';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const PRODUCT_API = `${API_BASE}/products`;
export const CATEGORY_API = `${API_BASE}/categories`;

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const { user } = useAuth();

    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(PRODUCT_API),
                axios.get(CATEGORY_API)
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load inventory or categories. Check server status.');
        }
    };

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === id);
        return cat ? cat.name : 'N/A';
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData(
            product
                ? {
                      ...product,
                      price: product.price.toString(),
                      stock_quantity: product.stock_quantity.toString(),
                      category_id: product.category_id,
                  }
                : {}
        );
        setMessage('');
        setError('');
    };

    const handleDelete = async (productId, productName) => {
        if (!window.confirm(`Are you sure you want to delete "${productName}"?`)) return;

        try {
            await axios.delete(
                `${PRODUCT_API}/manage/${productId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage(`Product "${productName}" deleted successfully.`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to delete product.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        const dataToSend = {
            ...formData,
            price: parseFloat(formData.price),
            stock_quantity: parseInt(formData.stock_quantity),
            category_id: parseInt(formData.category_id),
        };

        try {
            if (editingProduct) {
                await axios.put(
                    `${PRODUCT_API}/manage/${editingProduct.id}`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage("Product updated successfully.");
            } else {
                await axios.post(
                    `${PRODUCT_API}/manage`,
                    dataToSend,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setMessage("Product added successfully.");
            }

            setEditingProduct(null);
            setFormData({});
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product.');
        }
    };

    const OWNER_ID = 1;
    const isOwner = user && user.id === OWNER_ID;

    if (!isOwner) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p className="error-message">
                        Access Denied. You must be the site owner to manage inventory.
                    </p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="homepage-main-layout" style={{ maxWidth: '1400px' }}>
                <main className="product-display" style={{ width: '100%' }}>
                    <h1>🏗️ Product Inventory Management</h1>

                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    <button
                        onClick={() => handleEditClick(null)}
                        className="checkout-button"
                        style={{ marginBottom: '20px' }}
                    >
                        + Add New Product
                    </button>

                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Image</th>
                                <th>Name</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Category</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/50'}
                                            alt={product.name}
                                            width="50"
                                        />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>₹{parseFloat(product.price).toFixed(2)}</td>
                                    <td>{product.stock_quantity}</td>
                                    <td>{getCategoryName(product.category_id)}</td>
                                    <td>
                                        <button onClick={() => handleEditClick(product)}>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id, product.name)}
                                            className="remove-button"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </main>
            </div>

            <Footer />
        </>
    );
};

export default InventoryManager;
