import React, { useEffect, useState } from 'react';
import { API_BASE, authHeaders } from '../../lib/api';
import './MyOrders.css';
import { FaBox, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import { useShop } from '../../context/ShopContext';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useShop();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const url = `${API_BASE}/orders/myorders`
      const response = await fetch(url, {
        headers: authHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showToast('Error', error.message, 'warning');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <FaClock className="status-icon pending" />;
      case 'Packed': return <FaBox className="status-icon packed" />;
      case 'Shipped': return <FaTruck className="status-icon shipped" />;
      case 'Delivered': return <FaCheckCircle className="status-icon delivered" />;
      default: return <FaClock className="status-icon pending" />;
    }
  };

  if (loading) return <div className="page-loader">Loading orders...</div>;

  return (
    <div className="my-orders-page">
      <div className="orders-container">
        <h2>My Orders</h2>
        {orders.length === 0 ? (
          <p>You have no orders yet.</p>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div>
                    <span className="order-id">Order #{String(order._id || order.id || '').slice(-6)}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="order-status-badge">
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </div>
                </div>
                
                <div className="order-delivery">
                  <strong>Estimated Delivery:</strong> {order.estimatedDeliveryDate ? new Date(order.estimatedDeliveryDate).toLocaleDateString() : 'N/A'}
                </div>

                <div className="order-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item">
                      <span className="item-name">{item.productName} (Size: {item.size}) x {item.quantity}</span>
                      <span className="item-price">LKR {(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                
                <div className="order-footer">
                  <span className="payment-method">Payment: {order.paymentMethod.toUpperCase()}</span>
                  <strong className="order-total">Total: LKR {order.totalPrice.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;
