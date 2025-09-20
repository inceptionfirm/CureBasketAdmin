import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';

const CurrencyDemo: React.FC = () => {
  const { locale, formatCurrency, formatNumber, formatDate } = useLocale();

  const sampleData = {
    revenue: 125000.50,
    orders: 1234,
    date: new Date(),
    percentage: 85.67,
    price: 99.99,
    discount: 15.50
  };

  return (
    <div className="currency-demo">
      <h3>🌍 Global Locale Demo - {locale.country}</h3>
      <div className="demo-grid">
        <div className="demo-section">
          <h4>💰 Currency Examples</h4>
          <div className="demo-item">
            <strong>Revenue:</strong>
            <span>{formatCurrency(sampleData.revenue)}</span>
          </div>
          <div className="demo-item">
            <strong>Price:</strong>
            <span>{formatCurrency(sampleData.price)}</span>
          </div>
          <div className="demo-item">
            <strong>Discount:</strong>
            <span>{formatCurrency(sampleData.discount)}</span>
          </div>
        </div>

        <div className="demo-section">
          <h4>📊 Number Examples</h4>
          <div className="demo-item">
            <strong>Orders:</strong>
            <span>{formatNumber(sampleData.orders)}</span>
          </div>
          <div className="demo-item">
            <strong>Percentage:</strong>
            <span>{formatNumber(sampleData.percentage)}%</span>
          </div>
        </div>

        <div className="demo-section">
          <h4>📅 Date Examples</h4>
          <div className="demo-item">
            <strong>Today:</strong>
            <span>{formatDate(sampleData.date)}</span>
          </div>
          <div className="demo-item">
            <strong>Format:</strong>
            <span>{locale.dateFormat}</span>
          </div>
        </div>

        <div className="demo-section">
          <h4>🌐 Locale Info</h4>
          <div className="demo-item">
            <strong>Language:</strong>
            <span>{locale.language.toUpperCase()}</span>
          </div>
          <div className="demo-item">
            <strong>Currency:</strong>
            <span>{locale.currency} ({locale.currencySymbol})</span>
          </div>
          <div className="demo-item">
            <strong>Timezone:</strong>
            <span>{locale.timezone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyDemo;
