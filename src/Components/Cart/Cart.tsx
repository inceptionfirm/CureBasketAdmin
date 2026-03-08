/**
 * Cart Management – View all customer orders (purchased / shipped)
 * Same pattern as Prescriptions: list all orders, view details, update status.
 * Status flow: Customer checkout → Purchased; Admin sends → Shipped.
 */

import React, { useState, useEffect } from 'react';
import {
  cartService,
  type AdminOrder,
  type OrderStatus,
} from '../../services/cartService';
import { MOCK_ORDERS } from './mockCartData';
import AdminCartList from './AdminCartList';
import AdminCartDetails from './AdminCartDetails';
import './Cart.css';

const Cart: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');

  const stats = {
    total: orders.length,
    purchased: orders.filter((o) => o.status === 'PURCHASED').length,
    shipped: orders.filter((o) => o.status === 'SHIPPED').length,
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getAllOrders({
        page: 0,
        pageSize: 100,
      });
      let list = response.orders ?? [];
      if (list.length === 0) {
        list = MOCK_ORDERS;
      }
      setOrders(list);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load orders';
      setError(msg);
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOrderClick = (order: AdminOrder) => {
    setSelectedOrder(order);
  };

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    const previousOrders = orders;
    const previousSelected = selectedOrder;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) =>
      prev?.id === orderId ? { ...prev, status: newStatus } : prev
    );
    const result = await cartService.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      handleCloseDetails();
    } else {
      setOrders(previousOrders);
      setSelectedOrder(previousSelected);
      alert(result.message || 'Failed to update order status');
    }
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading-state">
          <div className="cart-spinner" />
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <div>
          <h1 className="cart-page-title">Customer Cart / Orders</h1>
          <p className="cart-page-description">
            View all orders. Purchased = after checkout; mark as Shipped when
            dispatched.
          </p>
        </div>
      </div>

      <div className="cart-stats-section">
        <button
          type="button"
          className={`cart-stat-item ${statusFilter === '' ? 'cart-stat-item-active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <span className="cart-stat-number">{stats.total}</span>
          <div className="cart-stat-label">Total</div>
        </button>
        <button
          type="button"
          className={`cart-stat-item ${statusFilter === 'PURCHASED' ? 'cart-stat-item-active' : ''}`}
          onClick={() => setStatusFilter('PURCHASED')}
        >
          <span className="cart-stat-number">{stats.purchased}</span>
          <div className="cart-stat-label">Purchased</div>
        </button>
        <button
          type="button"
          className={`cart-stat-item ${statusFilter === 'SHIPPED' ? 'cart-stat-item-active' : ''}`}
          onClick={() => setStatusFilter('SHIPPED')}
        >
          <span className="cart-stat-number">{stats.shipped}</span>
          <div className="cart-stat-label">Shipped</div>
        </button>
      </div>

      {error && (
        <div className="cart-error-banner">
          <p>{error}</p>
          <button type="button" onClick={loadOrders} className="cart-btn-refresh">
            Try Again
          </button>
        </div>
      )}

      {!error && (
        <AdminCartList
          orders={orders}
          onOrderClick={handleOrderClick}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      )}

      {selectedOrder && (
        <AdminCartDetails
          order={selectedOrder}
          onStatusChange={handleStatusChange}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default Cart;
