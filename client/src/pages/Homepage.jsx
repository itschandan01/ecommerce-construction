// client/src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import CategoryNav from '../components/CategoryNav';

const HomePage = () => {
    // --- STATE ---
    const [allProducts, setAllProducts] = useState([]);      
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [priceRange, setPriceRange] = useState([0, 100000]);

    const [stockFilter, setStockFilter] = useState({
        inStock: true,
        outOfStock: false,
        lowStock: false,
        bulkStock: false,
    });

    // --- HELPER FUNCTION: RECURSIVE CATEGORY LOOKUP ---
    const getAllCategoryIds = (parentId, categoryList) => {
        let ids = [Number(parentId)];
        categoryList.forEach(cat => {
            if (cat.parent_id && Number(cat.parent_id) === Number(parentId)) {
                ids = ids.concat(getAllCategoryIds(cat.id, categoryList));
            }
        });
        return ids;
    };

    // --- DATA FETCHING ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`),
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
                ]);

                setAllProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
                setCategories(Array.isArray(catRes.data) ? catRes.data : []);
                setError(null);
                setLoading(false);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError('Failed to fetch data from server. Please verify backend connection.');
                setAllProducts([]);
                setCategories([]);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- MAIN FILTERING ENGINE ---
    useEffect(() => {
        if (allProducts.length === 0 && !loading) return;

        let currentProducts = [...allProducts];
        
        // 1. Category Hierarchy Filter
        if (selectedCategoryId !== null && categories.length > 0) {
            const clickedId = Number(selectedCategoryId);
            const validCategoryIds = getAllCategoryIds(clickedId, categories);

            currentProducts = currentProducts.filter(p => {
                const productCatId = Number(p.category_id);
                return validCategoryIds.includes(productCatId);
            });
        }

        // 2. Search Filter
        if (searchTerm.trim() !== '') {
            const lowerCaseSearch = searchTerm.toLowerCase().trim();
            currentProducts = currentProducts.filter(p => 
                p.name.toLowerCase().includes(lowerCaseSearch) ||
                (p.description && p.description.toLowerCase().includes(lowerCaseSearch))
            );
        }

        // 3. Price Filter
        currentProducts = currentProducts.filter(
            p => Number(p.price) >= priceRange[0] && Number(p.price) <= priceRange[1]
        );

        // 4. Stock Filter
        currentProducts = currentProducts.filter((p) => {
            const qty = Number(p.stock_quantity);
            if (stockFilter.inStock && qty <= 0) return false;
            if (stockFilter.outOfStock && qty > 0) return false;
            return true;
        });

        setFilteredProducts(currentProducts);
    }, [selectedCategoryId, searchTerm, priceRange, stockFilter, allProducts, categories, loading]);

    if (loading) return (
        <>
            <Header />
            <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏗️</div>
                <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)' }}>Loading construction materials catalog...</p>
            </div>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <div style={{ textAlign: 'center', margin: '60px 20px' }}>
                <p className="error-message">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  style={{ padding: '10px 24px', backgroundColor: 'var(--color-orange-primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Retry Connection
                </button>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <Header />
            
            {/* HERO BANNER SECTION */}
            <section className="hero-banner">
                <div className="hero-content-wrapper">
                    <div className="hero-main-text">
                        <h1>
                            Build Your Vision With <span className="hero-highlight">Aditya Enterprises</span>
                        </h1>
                        <p className="hero-subtitle">
                            Your trusted partner for high-grade raw construction materials. From structural steel to OPC cement and building blocks, we supply quality materials for every project.
                        </p>
                        
                        <div className="hero-trust-row">
                            <div className="hero-trust-item">
                                <span className="trust-icon">✓</span> Genuine Materials
                            </div>
                            <div className="hero-trust-item">
                                <span className="trust-icon">✓</span> Bulk Availability
                            </div>
                            <div className="hero-trust-item">
                                <span className="trust-icon">✓</span> Reliable Supply
                            </div>
                            <div className="hero-trust-item">
                                <span className="trust-icon">✓</span> Direct Delivery
                            </div>
                        </div>
                    </div>

                    <div className="hero-card-side">
                        <h3>🏗️ Structural Excellence</h3>
                        <p>Supplying contractors, engineers, and builders with certified materials.</p>
                        <div className="hero-mini-stats">
                            <div className="stat-box">
                                <div className="stat-num">100%</div>
                                <div className="stat-label">Verified Quality</div>
                            </div>
                            <div className="stat-box">
                                <div className="stat-num">Fast</div>
                                <div className="stat-label">Site Delivery</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BUSINESS BENEFIT CARDS */}
            <section className="benefit-section">
                <div className="benefit-grid">
                    <div className="benefit-card">
                        <div className="benefit-icon-box">🚚</div>
                        <div>
                            <h4>Bulk Orders</h4>
                            <p>Special pricing & quantity supply for large construction sites.</p>
                        </div>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon-box">🛡️</div>
                        <div>
                            <h4>Quality Assurance</h4>
                            <p>Certified steel rebars, OPC cement, and structural blocks.</p>
                        </div>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon-box">👷</div>
                        <div>
                            <h4>Builder Supply</h4>
                            <p>Reliable recurring material supply for active contractors.</p>
                        </div>
                    </div>

                    <div className="benefit-card">
                        <div className="benefit-icon-box">☎️</div>
                        <div>
                            <h4>Customer Support</h4>
                            <p>Dedicated order assistance and site delivery tracking.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN MARKETPLACE LAYOUT */}
            <div className="homepage-main-layout"> 
                <aside className="sidebar">
                    <button 
                        onClick={() => setSelectedCategoryId(null)}
                        className="clear-filter-btn"
                        style={{ width: '100%', marginBottom: '20px', cursor: 'pointer' }}
                    >
                        Reset / All Materials
                    </button>

                    <CategoryNav onCategorySelect={setSelectedCategoryId} />

                    <div className="price-range-block" style={{marginTop: '20px'}}>
                        <h4>Price Range (₹)</h4>
                        <input
                            type="range"
                            min="0"
                            max="100000"
                            step="500"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                        />
                        <div className="price-values">
                            ₹0 – ₹{priceRange[1].toLocaleString()}
                        </div>
                    </div>
                </aside>
                
                <main className="product-display">
                    <div className="product-search-area">
                        <input
                            type="text"
                            placeholder="Search cement, bricks, TMT steel, pipes, materials..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input-field" 
                        />
                    </div>
                    
                    <div className="product-grid">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                        {filteredProducts.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: '40px', gridColumn: '1 / -1', padding: '3rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-slate-border)' }}>
                                <p style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    No construction materials found matching your criteria.
                                </p>
                                <button 
                                  onClick={() => setSelectedCategoryId(null)}
                                  style={{ padding: '10px 20px', background: 'var(--color-orange-primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 'bold' }}
                                >
                                  Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* DARK TRUST SECTION */}
            <section className="trust-section">
                <div className="trust-container">
                    <h2>Why Choose Aditya Enterprises?</h2>
                    <p className="trust-subtitle">
                        From foundation to finish, we supply verified materials built to withstand heavy structural demands.
                    </p>

                    <div className="trust-grid">
                        <div className="trust-card">
                            <div className="trust-icon-large">🧱</div>
                            <h3>Premium Materials</h3>
                            <p>High grade cement, steel, and blocks directly from trusted manufacturers.</p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon-large">📦</div>
                            <h3>Bulk Availability</h3>
                            <p>High volume stock ready for immediate site dispatches.</p>
                        </div>

                        <div className="trust-card">
                            <div className="trust-icon-large">💳</div>
                            <h3>Secure Checkout</h3>
                            <p>Integrated Razorpay payments and transparent billing.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
};

export default HomePage;