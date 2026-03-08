import React, { useState, useEffect } from 'react';
import type { AdminOrder, OrderStatus } from '../../services/cartService';
import './AdminCartList.css';

interface AdminCartListProps {
  orders: AdminOrder[];
  onOrderClick: (order: AdminOrder) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: OrderStatus | '';
  onStatusFilterChange: (status: OrderStatus | '') => void;
}

const AdminCartList: React.FC<AdminCartListProps> = ({
  orders,
  onOrderClick,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (order.customerMobile?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedOrders = filteredOrders.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      total: filteredOrders.length,
      totalPages: Math.max(1, Math.ceil(filteredOrders.length / prev.pageSize)),
      current:
        prev.current > Math.ceil(filteredOrders.length / prev.pageSize)
          ? 1
          : prev.current,
    }));
  }, [filteredOrders.length, pagination.pageSize]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchTerm, statusFilter]);

  return (
    <div className="admin-cart-list">
      <div className="cart-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by order ID, customer name, mobile, or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as OrderStatus | '')}
            className="status-filter-select"
          >
            <option value="">All Status</option>
            <option value="PURCHASED">Purchased</option>
            <option value="SHIPPED">Shipped</option>
          </select>
        </div>
      </div>

      <div className="cart-results-count">
        <p>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="cart-list-empty">
          <div className="empty-icon">🛒</div>
          <h3>No Orders Found</h3>
          <p>No orders match your filters, or the order list is empty.</p>
        </div>
      ) : (
        <>
          <div className="orders-grid">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="order-card"
                onClick={() => onOrderClick(order)}
              >
                <div className="order-card-header">
                  <div className="order-card-title-section">
                    <h3 className="order-card-id">{order.orderId}</h3>
                    <p className="order-card-date">
                      {order.status === 'PURCHASED' ? 'Purchased' : 'Shipped'}:{' '}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`order-status-badge order-status-${order.status.toLowerCase()}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <div className="order-card-info-row">
                    <span className="card-info-label">Customer:</span>
                    <span className="card-info-value">
                      {order.customerName || `#${order.customerId}`}
                    </span>
                  </div>
                  {order.customerMobile && (
                    <div className="order-card-info-row">
                      <span className="card-info-label">Mobile:</span>
                      <span className="card-info-value">{order.customerMobile}</span>
                    </div>
                  )}
                  <div className="order-card-info-row">
                    <span className="card-info-label">Items:</span>
                    <span className="card-info-value">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {order.totalAmount != null && (
                    <div className="order-card-info-row">
                      <span className="card-info-label">Total:</span>
                      <span className="card-info-value amount-value">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="order-card-footer">
                  <button type="button" className="btn-view-details">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination.total > pagination.pageSize && (
            <div className="cart-pagination">
              <button
                type="button"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, current: prev.current - 1 }))
                }
                disabled={pagination.current === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.current} of {pagination.totalPages} ({pagination.total}{' '}
                total)
              </span>
              <button
                type="button"
                onClick={() =>
                  setPagination((prev) => ({ ...prev, current: prev.current + 1 }))
                }
                disabled={pagination.current >= pagination.totalPages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminCartList;
