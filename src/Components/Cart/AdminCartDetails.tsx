import React from 'react';
import type { AdminOrder, CartItem, OrderStatus } from '../../services/cartService';
import './AdminCartDetails.css';

const IMAGE_BASE = 'https://java.api.curebasket.com';

function buildImageUrl(path?: string): string | null {
  if (!path?.trim()) return null;
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? `${IMAGE_BASE}${path}` : `${IMAGE_BASE}/${path}`;
}

interface AdminCartDetailsProps {
  order: AdminOrder;
  onStatusChange: (orderId: number, newStatus: OrderStatus) => void;
  onClose: () => void;
}

const AdminCartDetails: React.FC<AdminCartDetailsProps> = ({
  order,
  onStatusChange,
  onClose,
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const lineTotal = (item: CartItem) => {
    const price = item.medicine?.price ?? 0;
    const qty = item.itemQuantity ?? 1;
    return price * qty;
  };

  const handleMarkShipped = () => {
    if (order.status !== 'PURCHASED') return;
    onStatusChange(order.id, 'SHIPPED');
    // Modal is closed by parent after successful status update
  };

  return (
    <div className="admin-cart-details-overlay" onClick={onClose}>
      <div
        className="admin-cart-details-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart-details-header">
          <div className="cart-details-title-section">
            <h2 className="cart-details-title">Order Details</h2>
            <p className="cart-details-order-id">{order.orderId}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-close-modal"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="cart-details-content">
          <section className="cart-section">
            <h3 className="section-title">Order & Customer</h3>
            <div className="section-content">
              <div className="info-row">
                <span className="info-label">Order ID</span>
                <span className="info-value">{order.orderId}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status</span>
                <span
                  className={`order-status-badge order-status-${order.status.toLowerCase()}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Date</span>
                <span className="info-value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Customer</span>
                <span className="info-value">
                  {order.customerName || `Customer #${order.customerId}`}
                </span>
              </div>
              {order.customerEmail && (
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{order.customerEmail}</span>
                </div>
              )}
              {order.customerMobile && (
                <div className="info-row">
                  <span className="info-label">Mobile</span>
                  <span className="info-value">{order.customerMobile}</span>
                </div>
              )}
            </div>
          </section>

          <section className="cart-section">
            <h3 className="section-title">Items ({order.items.length})</h3>
            <div className="cart-items-detail-list">
              {order.items.map((item) => {
                const imgUrl =
                  item.medicine?.image ||
                  (item.medicine?.files?.[0] as { docPath?: string } | undefined)?.docPath;
                const src = buildImageUrl(imgUrl);
                return (
                  <div key={item.id} className="cart-detail-item">
                    <div className="cart-detail-item-image">
                      {src ? (
                        <img
                          src={src}
                          alt={item.medicine?.name || 'Item'}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="img-placeholder">💊</div>
                      )}
                    </div>
                    <div className="cart-detail-item-info">
                      <h4>{item.medicine?.name || `Medicine #${item.medicineId}`}</h4>
                      <p className="item-qty">Qty: {item.itemQuantity}</p>
                      <p className="item-price">
                        {item.medicine?.price != null
                          ? formatCurrency(item.medicine.price) + ' each'
                          : '—'}
                      </p>
                      <p className="item-line-total">
                        Line total: {formatCurrency(lineTotal(item))}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            {order.totalAmount != null && (
              <div className="cart-detail-total">
                <span className="total-label">Order Total</span>
                <span className="total-amount">{formatCurrency(order.totalAmount)}</span>
              </div>
            )}
          </section>

          {order.status === 'PURCHASED' && (
            <div className="cart-details-actions">
              <button
                type="button"
                className="btn-mark-shipped"
                onClick={handleMarkShipped}
              >
                Mark as Shipped
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCartDetails;
