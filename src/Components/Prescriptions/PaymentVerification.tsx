import React from 'react';
import './PaymentVerification.css';

interface PaymentVerificationProps {
  transactionId?: string;
  amount?: number;
  paymentScreenshot?: string;
  onVerify: () => void;
  className?: string;
}

const PaymentVerification: React.FC<PaymentVerificationProps> = ({
  transactionId,
  amount,
  paymentScreenshot,
  onVerify,
  className = ''
}) => {
  return (
    <div className={`payment-verification ${className}`}>
      <div className="payment-verification-header">
        <h3 className="payment-verification-title">Payment Information</h3>
      </div>

      <div className="payment-details">
        <div className="payment-detail-row">
          <span className="payment-label">Transaction ID:</span>
          <span className="payment-value">
            {transactionId || <span className="payment-missing">Not provided</span>}
          </span>
        </div>

        <div className="payment-detail-row">
          <span className="payment-label">Amount Paid:</span>
          <span className="payment-value">
            {amount ? `₹${amount.toLocaleString('en-IN')}` : <span className="payment-missing">Not provided</span>}
          </span>
        </div>

        {paymentScreenshot && (
          <div className="payment-screenshot-section">
            <span className="payment-label">Payment Screenshot:</span>
            <div className="payment-screenshot-container">
              <img
                src={paymentScreenshot}
                alt="Payment screenshot"
                className="payment-screenshot"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <a
                href={paymentScreenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="payment-screenshot-link"
              >
                View Full Image
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="payment-verification-actions">
        <button
          type="button"
          onClick={onVerify}
          className="btn-verify-payment"
          disabled={!transactionId || !amount}
          title={!transactionId || !amount ? 'Transaction ID and amount required to verify' : 'Verify payment'}
        >
          <span className="button-icon">✓</span>
          Verify Payment
        </button>
      </div>

      {(!transactionId || !amount) && (
        <div className="payment-warning">
          <p>⚠️ Transaction ID and amount are required to verify payment</p>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
