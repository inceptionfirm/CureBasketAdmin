import React from 'react';
import { useLocale } from '../../contexts/LocaleContext';

const LocaleDemo: React.FC = () => {
  const { locale, formatCurrency, formatDate, formatNumber } = useLocale();

  const sampleData = {
    revenue: 125000.50,
    orders: 1234,
    date: new Date(),
    percentage: 85.67
  };

  return (
    <div className="locale-demo">
      <h3>Locale Demo - {locale.country}</h3>
      <div className="demo-grid">
        <div className="demo-item">
          <strong>Currency:</strong>
          <span>{formatCurrency(sampleData.revenue)}</span>
        </div>
        <div className="demo-item">
          <strong>Number:</strong>
          <span>{formatNumber(sampleData.orders)}</span>
        </div>
        <div className="demo-item">
          <strong>Date:</strong>
          <span>{formatDate(sampleData.date)}</span>
        </div>
        <div className="demo-item">
          <strong>Percentage:</strong>
          <span>{formatNumber(sampleData.percentage)}%</span>
        </div>
        <div className="demo-item">
          <strong>Language:</strong>
          <span>{locale.language.toUpperCase()}</span>
        </div>
        <div className="demo-item">
          <strong>Timezone:</strong>
          <span>{locale.timezone}</span>
        </div>
      </div>
    </div>
  );
};

export default LocaleDemo;
