import { useEffect, useState } from "react";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";

// ✅ DEFINE API_BASE (no renaming, just fixing)
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/api`;

const AddProduct = () => {
  const token = localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock_quantity: "",
    image_url: "",
    category_id: "",
  });

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_BASE}/products`),
        axios.get(`${API_BASE}/categories`).catch(() => ({ data: [] })),
      ]);
      setProducts(Array.isArray(prodRes.data) ? prodRes.data : []);
      setCategories(Array.isArray(catRes.data) ? catRes.data : []);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Stats calculation
  const totalProducts = products.length;
  const lowStock = products.filter(
    (p) => p.stock_quantity > 0 && p.stock_quantity < 50
  ).length;
  const outOfStock = products.filter((p) => p.stock_quantity === 0).length;

  const openAddModal = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      price: "",
      stock_quantity: "",
      image_url: "",
      category_id: "",
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock_quantity: product.stock_quantity,
      image_url: product.image_url || "",
      category_id: product.category_id,
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock_quantity: parseInt(form.stock_quantity),
      category_id: parseInt(form.category_id),
    };

    if (isNaN(payload.category_id)) {
      alert("Please enter a valid Category ID (Number)");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (editId) {
        await axios.put(
          `${API_BASE}/products/manage/${editId}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${API_BASE}/products/manage`,
          payload,
          config
        );
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(
        "Product save failed:",
        err.response?.data || err.message
      );
      alert(`Error: ${err.response?.data?.error || "Check server console"}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await axios.delete(`${API_BASE}/products/manage/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <>
      <Header />

      <div className="inventory-page">
        <div className="inventory-header">
          <div className="inventory-title-info">
            <h1>Inventory Manager</h1>
            <p>Add, update, and manage construction materials</p>
          </div>

          <div className="inventory-actions">
            <button className="primary-btn" onClick={openAddModal}>
              + Add Product
            </button>
            <div className="stats">
              <span>
                Total <strong>{totalProducts}</strong>
              </span>
              <span className="warn">
                Low Stock <strong>{lowStock}</strong>
              </span>
              <span className="danger">
                Out <strong>{outOfStock}</strong>
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Loading products...</p>
        ) : (
          <div className="table-container">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="table-img"
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{p.name}</td>
                    <td>₹{parseFloat(p.price).toFixed(2)}</td>
                    <td>{p.stock_quantity}</td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="edit-btn"
                          onClick={() => openEditModal(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(p.id)}
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
        )}

        {showModal && (
          <div className="modal-overlay">
            <form className="modal" onSubmit={handleSubmit}>
              <h2>{editId ? "Edit Product" : "Add New Product"}</h2>

              <div className="form-group">
                <label>Product Name</label>
                <input
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  placeholder="Details"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock Qty</label>
                  <input
                    name="stock_quantity"
                    type="number"
                    value={form.stock_quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  name="image_url"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                {categories.length > 0 ? (
                  <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (ID: {c.id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="category_id"
                    type="number"
                    placeholder="Enter Category ID"
                    value={form.category_id}
                    onChange={handleChange}
                    required
                  />
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="save-btn">
                  Save Product
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AddProduct;
