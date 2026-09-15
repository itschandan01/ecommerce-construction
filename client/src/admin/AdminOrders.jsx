import React, { useEffect, useState } from "react";
import api from "../services/api";
import Header from "../components/Header";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const res = await api.get("/admin/orders");
    setOrders(res.data);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "pending" ? "done" : "pending";

    await api.put(`/admin/orders/${id}/status`, {
      status: newStatus
    });

    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <>
      <Header />

      <div className="inventory-container">
        <h2>📦 Orders Manager</h2>

        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer_name}</td>
                <td>₹{order.total_amount}</td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className={
                      order.status === "done"
                        ? "status-done"
                        : "status-pending"
                    }
                    onClick={() =>
                      toggleStatus(order.id, order.status)
                    }
                  >
                    {order.status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminOrders;
