import React, { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";
import Footer from "../components/Footer";

const safeFormatDate = (rawDate) => {
  if (!rawDate) return "Date unavailable";
  const dateObj = new Date(rawDate);
  if (isNaN(dateObj.getTime())) return "Date unavailable";
  return dateObj.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  });
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/admin/orders");
      setOrders(Array.isArray(res.data) ? res.data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
      setError("Failed to load orders from server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "done" || currentStatus === "CONFIRMED" ? "pending" : "done";

    try {
      await api.put(`/admin/orders/${id}/status`, {
        status: newStatus
      });

      setOrders(prev =>
        prev.map(order =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <>
      <Header />

      <div className="homepage-main-layout" style={{ maxWidth: '1400px', display: 'block', margin: '2rem auto' }}>
        <div className="admin-page-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', marginBottom: '0.4rem', fontWeight: 800 }}>📦 Orders Manager</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Manage construction material site delivery orders and statuses.</p>
          </div>
          <div className="admin-stats-pills" style={{ marginTop: '1rem' }}>
            <span className="pill" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              Total Orders: <strong style={{ color: 'var(--color-orange-primary)' }}>{orders.length}</strong>
            </span>
          </div>
        </div>

        {loading ? (
          <p className="loading-text" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading customer orders...</p>
        ) : error ? (
          <p className="error-message" style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)' }}>{error}</p>
        ) : (
          <div className="table-responsive-container" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-slate-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
            <table className="inventory-table admin-orders-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-light)', color: 'var(--color-text-muted)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right' }}>Total Amount</th>
                  <th style={{ padding: '14px 18px', textAlign: 'left' }}>Order Date</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 18px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-slate-border)' }}>
                    <td style={{ padding: '14px 18px', fontWeight: '700', color: 'var(--color-text-main)' }}>#{order.id}</td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--color-text-main)' }}>{order.customer_name || order.user_name || "Customer"}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-medium)' }}>{order.email || ""}</div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800', color: 'var(--color-orange-primary)' }}>
                      ₹{Number(order.total_amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '14px 18px', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                      {safeFormatDate(order.created_at || order.date)}
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <span className={`status-badge ${String(order.status).toLowerCase()}`} style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', background: order.status === 'done' || order.status === 'PAID' ? '#d1fae5' : '#fef3c7', color: order.status === 'done' || order.status === 'PAID' ? '#065f46' : '#92400e' }}>
                        {order.status || "PLACED"}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <button
                        className="status-toggle-btn"
                        style={{ padding: '6px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-slate-border)', background: 'var(--color-bg-light)', color: 'var(--color-text-main)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                        onClick={() => toggleStatus(order.id, order.status)}
                      >
                        Toggle Status
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "var(--color-text-muted)" }}>
                      No orders found in system.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default AdminOrders;
