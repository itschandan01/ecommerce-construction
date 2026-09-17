// client/src/pages/InventoryManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;
const PRODUCT_API = `${API_BASE}/products`;
const CATEGORY_API = `${API_BASE}/categories`;

const DEFAULT_CONSTRUCTION_IMAGE = "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=500&auto=format&fit=crop&q=60";
const ADMIN_EMAIL = "adityaenterprisesofficial62@gmail.com";

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const token = localStorage.getItem("token");

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, categoriesRes] = await Promise.all([
                axios.get(PRODUCT_API),
                axios.get(CATEGORY_API).catch(() => ({ data: [] }))
            ]);
            setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
            setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
            setError('');
        } catch (err) {
            setError('Failed to load inventory or categories. Check server status.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getCategoryName = (id) => {
        const cat = categories.find(c => c.id === Number(id));
        return cat ? cat.name : 'General Material';
    };

    const handleEditClick = (product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price ? product.price.toString() : '',
                stock_quantity: product.stock_quantity ? product.stock_quantity.toString() : '',
                image_url: product.image_url || '',
                category_id: product.category_id ? product.category_id.toString() : '',
            });
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock_quantity: '',
                image_url: '',
                category_id: '',
            });
        }
        setMessage('');
        setError('');
        setShowModal(true);
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
            category_id: parseInt(formData.category_id || '1'),
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

            setShowModal(false);
            setEditingProduct(null);
            setFormData({});
            fetchData();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save product.');
        }
    };

    const isAdmin = Boolean(
        user?.email && user.email.toLowerCase().trim() === ADMIN_EMAIL
    );

    if (!isAdmin) {
        return (
            <>
                <Header />
                <div style={{ textAlign: 'center', marginTop: '60px', padding: '3rem 2rem' }}>
                    <p className="error-message">
                        Access Denied. You must be an administrator to manage inventory.
                    </p>
                </div>
                <Footer />
            </>
        );
    }

    const totalProducts = products.length;
    const lowStock = products.filter(p => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 10).length;
    const outOfStock = products.filter(p => Number(p.stock_quantity) === 0).length;

    return (
        <>
            <Header />

            <div className="homepage-main-layout" style={{ maxWidth: '1400px', display: 'block', margin: '2rem auto' }}>
                <main className="product-display" style={{ width: '100%' }}>
                    {/* Header Banner */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--color-orange-primary)' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', color: 'var(--color-text-main)', marginBottom: '0.4rem', fontWeight: 800 }}>
                                🏗️ Inventory Manager
                            </h1>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem' }}>
                                Manage construction materials, pricing, and inventory.
                            </p>
                        </div>

                        <button
                            onClick={() => handleEditClick(null)}
                            className="checkout-button"
                            style={{ padding: '12px 24px', fontSize: '0.95rem', fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                        >
                            + Add Product
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Total Products</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-text-main)', marginTop: '6px' }}>{totalProducts}</div>
                        </div>

                        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-warning)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Low Stock (≤10)</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-warning)', marginTop: '6px' }}>{lowStock}</div>
                        </div>

                        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ fontSize: '0.85rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Out of Stock</div>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#dc2626', marginTop: '6px' }}>{outOfStock}</div>
                        </div>
                    </div>

                    {error && <p className="error-message" style={{ marginBottom: '1.5rem' }}>{error}</p>}
                    {message && <p className="success-message" style={{ marginBottom: '1.5rem', padding: '12px', background: '#d1fae5', color: '#065f46', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>{message}</p>}

                    {/* Product Inventory Table */}
                    {loading ? (
                        <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Loading inventory...</p>
                    ) : (
                        <div style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="inventory-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <th style={{ padding: '14px 18px', textAlign: 'left' }}>ID</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'center' }}>Image</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'left' }}>Product Name</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'left' }}>Category</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'right' }}>Price</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'center' }}>Stock Qty</th>
                                            <th style={{ padding: '14px 18px', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id} style={{ borderBottom: '1px solid var(--color-slate-border)' }}>
                                                <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--color-text-main)' }}>#{product.id}</td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <img
                                                        src={product.image_url || DEFAULT_CONSTRUCTION_IMAGE}
                                                        alt={product.name}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_CONSTRUCTION_IMAGE; }}
                                                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '14px 18px', fontWeight: '600', color: 'var(--color-text-main)' }}>
                                                    {product.name}
                                                </td>
                                                <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                                    <span style={{ background: 'var(--color-bg-light)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-slate-border)', fontWeight: 600 }}>
                                                        {getCategoryName(product.category_id)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: 'var(--color-orange-primary)' }}>
                                                    ₹{parseFloat(product.price).toFixed(2)}
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 12px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '700',
                                                        background: product.stock_quantity === 0 ? '#fee2e2' : product.stock_quantity <= 10 ? '#fef3c7' : '#d1fae5',
                                                        color: product.stock_quantity === 0 ? '#dc2626' : product.stock_quantity <= 10 ? '#92400e' : '#065f46'
                                                    }}>
                                                        {product.stock_quantity}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)', background: 'var(--color-bg-light)', color: 'var(--color-text-main)', cursor: 'pointer', fontWeight: '600' }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid #fca5a5', background: '#fee2e2', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Modal Form for Add/Edit Product */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>{editingProduct ? "✏️ Edit Product" : "➕ Add Product"}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Product Name</label>
                                <input
                                    name="name"
                                    placeholder="Product Name"
                                    value={formData.name || ''}
                                    onChange={handleChange}
                                    required
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    name="description"
                                    placeholder="Product description"
                                    rows={3}
                                    value={formData.description || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Price (₹)</label>
                                    <input
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.price || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Stock Quantity</label>
                                    <input
                                        name="stock_quantity"
                                        type="number"
                                        placeholder="0"
                                        value={formData.stock_quantity || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Image URL</label>
                                <input
                                    name="image_url"
                                    placeholder="https://..."
                                    value={formData.image_url || ''}
                                    onChange={handleChange}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600, fontSize: '0.9rem' }}>Category</label>
                                {categories.length > 0 ? (
                                    <select
                                        name="category_id"
                                        value={formData.category_id || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        name="category_id"
                                        type="number"
                                        placeholder="Category ID (Number)"
                                        value={formData.category_id || ''}
                                        onChange={handleChange}
                                        required
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)' }}
                                    />
                                )}
                            </div>

                            <div className="modal-actions" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary">
                                    Save Product
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default InventoryManager;
