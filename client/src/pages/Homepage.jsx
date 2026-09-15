// // client/src/pages/HomePage.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import Header from '../components/Header';
// import Footer from '../components/Footer';
// import ProductCard from '../components/ProductCard';
// import CategoryNav from '../components/CategoryNav';

// const HomePage = () => {
//     // --- STATE ---
//     const [allProducts, setAllProducts] = useState([]);
//     const [filteredProducts, setFilteredProducts] = useState([]);
//     const [categories, setCategories] = useState([]); // ✅ Added for hierarchy logic
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [selectedCategoryId, setSelectedCategoryId] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [priceRange, setPriceRange] = useState([0, 100000]);

//     const [stockFilter, setStockFilter] = useState({
//         inStock: true,
//         outOfStock: false,
//         lowStock: false,
//         bulkStock: false,
//     });

//     // --- HELPER FUNCTION ---
//     // Recursively finds all IDs of a category and its subcategories
//     const getAllCategoryIds = (parentId, categoryList) => {
//         let ids = [parentId];
//         categoryList.forEach(cat => {
//             // Use == for loose equality in case one is a string and other is a number
//             if (cat.parent_id == parentId) {
//                 ids = ids.concat(getAllCategoryIds(cat.id, categoryList));
//             }
//         });
//         return ids;
//     };

//     // --- DATA FETCHING ---
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 // Fetch Products and Categories in parallel
//                 const [prodRes, catRes] = await Promise.all([
//                     axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`),
//                     axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
//                 ]);

//                 setAllProducts(prodRes.data);
//                 setCategories(catRes.data);
//                 setLoading(false);
//             } catch (err) {
//                 console.error("Fetch Error:", err);
//                 setError('Failed to fetch data. Please check the backend connection.');
//                 setLoading(false);
//             }
//         };
//         fetchData();
//     }, []);

//     // --- MAIN FILTERING LOGIC ---
//     useEffect(() => {
//         let currentProducts = [...allProducts];

//         // 1. Category Filter (Parent + Children)
//         if (selectedCategoryId !== null && categories.length > 0) {
//             const validCategoryIds = getAllCategoryIds(Number(selectedCategoryId), categories);
//             currentProducts = currentProducts.filter(p =>
//                 validCategoryIds.includes(Number(p.category_id))
//             );
//         }

//         // 2. Search Filter
//         if (searchTerm.trim() !== '') {
//             const lowerCaseSearch = searchTerm.toLowerCase().trim();
//             currentProducts = currentProducts.filter(p =>
//                 p.name.toLowerCase().includes(lowerCaseSearch) ||
//                 p.description.toLowerCase().includes(lowerCaseSearch)
//             );
//         }

//         // 3. Price Filter
//         currentProducts = currentProducts.filter(
//             p => p.price >= priceRange[0] && p.price <= priceRange[1]
//         );

//         // 4. Stock-based filtering
//         currentProducts = currentProducts.filter((p) => {
//             const qty = p.stock_quantity;
//             if (stockFilter.inStock && qty <= 0) return false;
//             if (stockFilter.outOfStock && qty > 0) return false;
//             if (stockFilter.lowStock && qty >= 50) return false;
//             if (stockFilter.bulkStock && qty < 500) return false;
//             return true;
//         });

//         setFilteredProducts(currentProducts);
//     }, [selectedCategoryId, searchTerm, priceRange, stockFilter, allProducts, categories]);

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     if (loading) return (
//         <>
//             <Header />
//             <p className="loading" style={{ textAlign: 'center', marginTop: '40px' }}>Loading products...</p>
//             <Footer />
//         </>
//     );

//     if (error) return (
//         <>
//             <Header />
//             <div style={{ textAlign: 'center', margin: '40px' }}>
//                 <p className="error-message">{error}</p>
//                 <button onClick={() => window.location.reload()}>Retry</button>
//             </div>
//             <Footer />
//         </>
//     );

//     return (
//         <>
//             <Header />

//             <section className="hero-banner">
//                 <div className="hero-content">
//                     <h1>Build Strong. Build Smart.</h1>
//                     <p>Premium construction materials for modern projects</p>
//                     <button className="hero-btn">Explore Materials</button>
//                 </div>
//             </section>

//             <div className="homepage-main-layout">
//                 <aside className="sidebar">
//                     {/* Ensure CategoryNav uses setSelectedCategoryId correctly */}
//                     <CategoryNav onCategorySelect={setSelectedCategoryId} />

//                     <div className="price-range-block">
//                         <h4>Price Range (₹)</h4>
//                         <input
//                             type="range"
//                             min="0"
//                             max="100000"
//                             step="500"
//                             value={priceRange[1]}
//                             onChange={(e) => setPriceRange([0, Number(e.target.value)])}
//                         />
//                         <div className="price-values">
//                             ₹0 – ₹{priceRange[1].toLocaleString()}
//                         </div>
//                     </div>

//                     <div className="stock-filter">
//                         <h4>Availability</h4>
//                         <label>
//                             <input
//                                 type="checkbox"
//                                 checked={stockFilter.inStock}
//                                 onChange={() => setStockFilter({ ...stockFilter, inStock: !stockFilter.inStock })}
//                             />
//                             In Stock
//                         </label>

//                         <label>
//                             <input
//                                 type="checkbox"
//                                 checked={stockFilter.outOfStock}
//                                 onChange={() => setStockFilter({ ...stockFilter, outOfStock: !stockFilter.outOfStock })}
//                             />
//                             Out of Stock
//                         </label>

//                         <h4 style={{ marginTop: "15px" }}>Stock Level</h4>
//                         <label>
//                             <input
//                                 type="checkbox"
//                                 checked={stockFilter.lowStock}
//                                 onChange={() => setStockFilter({ ...stockFilter, lowStock: !stockFilter.lowStock })}
//                             />
//                             Low Stock (&lt; 50)
//                         </label>

//                         <label>
//                             <input
//                                 type="checkbox"
//                                 checked={stockFilter.bulkStock}
//                                 onChange={() => setStockFilter({ ...stockFilter, bulkStock: !stockFilter.bulkStock })}
//                             />
//                             Bulk Available (≥ 500)
//                         </label>
//                     </div>
//                 </aside>

//                 <main className="product-display">
//                     <div className="product-search-area">
//                         <input
//                             type="text"
//                             placeholder="Search by name or description..."
//                             value={searchTerm}
//                             onChange={handleSearchChange}
//                             className="search-input-field"
//                         />
//                     </div>

//                     <div className="product-grid">
//                         {filteredProducts.map((product) => (
//                             <ProductCard key={product.id} product={product} />
//                         ))}
//                         {filteredProducts.length === 0 && (
//                             <p style={{ marginTop: '20px', color: '#666' }}>
//                                 No products found matching your criteria.
//                             </p>
//                         )}
//                     </div>
//                 </main>
//             </div>
//             <Footer />
//         </>
//     );
// };

// export default HomePage;

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
    // Finds the clicked ID + all its child sub-category IDs
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
                // Fetch products and categories in parallel
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
            <p style={{textAlign: 'center', marginTop: '40px'}}>Loading products...</p>
            <Footer />
        </>
    );

    if (error) return (
        <>
            <Header />
            <div style={{ textAlign: 'center', margin: '60px 20px' }}>
                <p className="error-message" style={{ color: '#d9534f', fontSize: '1.2rem', marginBottom: '20px' }}>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  style={{ padding: '10px 24px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
            
            <section className="hero-banner">
                <div className="hero-content">
                    <h1>Build Strong. Build Smart.</h1>
                    <p>Premium construction materials for modern projects</p>
                </div>
            </section>

            <div className="homepage-main-layout"> 
                <aside className="sidebar">
                    {/* RESET BUTTON: Essential for clearing filters */}
                    <button 
                        onClick={() => setSelectedCategoryId(null)}
                        className="clear-filter-btn"
                        style={{ width: '100%', marginBottom: '20px', cursor: 'pointer' }}
                    >
                        SHOW ALL PRODUCTS
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
                            placeholder="Search materials..."
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
                            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                                <p>No products found for this category.</p>
                                <button onClick={() => setSelectedCategoryId(null)}>Clear Filter</button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
};

export default HomePage;