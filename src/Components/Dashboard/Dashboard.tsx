import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import LocaleDemo from './LocaleDemo';
import CurrencyDemo from './CurrencyDemo';
import { Category } from '../../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { formatCurrency, formatDate, formatNumber, t } = useLocale();
  
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  
  // Static data - no API calls, no services, no complex state management
  const categories: Category[] = [
    {
      id: 1,
      name: 'Medicines',
      color: '#10b981',
      icon: '💊',
      isActive: true,
      elements: [
        { id: 1, name: 'Prescription Drugs', isActive: true },
        { id: 2, name: 'Over-the-Counter', isActive: true },
        { id: 3, name: 'Vitamins', isActive: false }
      ]
    },
    {
      id: 2,
      name: 'Health Products',
      color: '#3b82f6',
      icon: '🏥',
      isActive: true,
      elements: [
        { id: 4, name: 'Medical Devices', isActive: true },
        { id: 5, name: 'Health Supplements', isActive: true }
      ]
    },
    {
      id: 3,
      name: 'Personal Care',
      color: '#f59e0b',
      icon: '🧴',
      isActive: true,
      elements: [
        { id: 6, name: 'Skincare', isActive: true },
        { id: 7, name: 'Hair Care', isActive: false }
      ]
    }
  ];

  const dashboardData = {
    ordersCompleted: 1247,
    buyers: 892,
    revenue: 45678.90,
    orderHistory: [
      { id: '1', status: 'completed', date: '2024-01-20' },
      { id: '2', status: 'pending', date: '2024-01-19' },
      { id: '3', status: 'completed', date: '2024-01-18' },
      { id: '4', status: 'processing', date: '2024-01-17' },
      { id: '5', status: 'completed', date: '2024-01-16' }
    ]
  };

  // Simple real-time date/time update - no complex logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // No loading states needed - static data renders immediately

  // Static data is ready - no calculations needed

  return (
    <div className="dashboard-container">
      {/* Clean Dashboard Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="page-title">{t('dashboard.title')}</h1>
            <p className="page-subtitle">{t('dashboard.welcome')}</p>
          </div>
          <div className="header-right">
            <div className="date-time">
              <div className="date">{formatDate(currentDateTime)}</div>
              <div className="time">{currentDateTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit'
              })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="filters-section">
        <div className="filters-header">
          <h3 className="section-title">{t('dashboard.searchFilters')}</h3>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder="Search orders, products, customers..." 
              className="search-input"
            />
            <button className="search-btn">🔍</button>
          </div>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Date Range</label>
            <div className="date-range">
              <input type="date" className="date-input" />
              <span>to</span>
              <input type="date" className="date-input" />
            </div>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Category</label>
            <select className="filter-select">
              <option value="">All Categories</option>
              <option value="medical">Medical Supplies</option>
              <option value="pharmaceuticals">Pharmaceuticals</option>
              <option value="equipment">Equipment</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="filter-btn primary">Apply Filters</button>
            <button className="filter-btn secondary">Clear All</button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-section">
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{formatNumber(dashboardData.ordersCompleted)}</div>
            <div className="metric-label">{t('dashboard.ordersCompleted')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatNumber(dashboardData.buyers)}</div>
            <div className="metric-label">{t('dashboard.activeBuyers')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{formatCurrency(dashboardData.revenue)}</div>
            <div className="metric-label">{t('dashboard.totalRevenue')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">3.2%</div>
            <div className="metric-label">{t('dashboard.conversionRate')}</div>
          </div>
        </div>
      </div>


      {/* Simple Dynamic Charts Section */}
      <div className="charts-section">
        <h3 className="section-title">{t('dashboard.analyticsReports')}</h3>
        
        <div className="charts-container">
          {/* Revenue Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Revenue Trend</h4>
              <select className="chart-period">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            <div className="chart-content">
              <div className="chart-bars">
                {[65, 80, 45, 90, 75, 85, 70].map((height, index) => (
                  <div key={index} className="chart-bar" style={{height: `${height}%`}}>
                    <span className="bar-value">{height}%</span>
                  </div>
                ))}
              </div>
              <div className="chart-labels">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>
          </div>

          {/* Orders Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Orders Status</h4>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color completed"></span>
                  <span>Completed</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color pending"></span>
                  <span>Pending</span>
                </div>
              </div>
            </div>
            <div className="chart-content">
              <div className="donut-chart">
                <div className="donut-center">
                  <div className="donut-value">85%</div>
                  <div className="donut-label">Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Top Categories</h4>
            </div>
            <div className="chart-content">
              <div className="category-bars">
                <div className="category-bar">
                  <div className="category-info">
                    <span className="category-name">Medical Supplies</span>
                    <span className="category-percent">45%</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-fill" style={{width: '45%'}}></div>
                  </div>
                </div>
                <div className="category-bar">
                  <div className="category-info">
                    <span className="category-name">Pharmaceuticals</span>
                    <span className="category-percent">30%</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-fill" style={{width: '30%'}}></div>
                  </div>
                </div>
                <div className="category-bar">
                  <div className="category-info">
                    <span className="category-name">Equipment</span>
                    <span className="category-percent">25%</span>
                  </div>
                  <div className="category-progress">
                    <div className="progress-fill" style={{width: '25%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      

      {/* Data Tables Section */}
      <div className="tables-section">
        <div className="tables-grid">
          {/* Recent Orders Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">Recent Orders</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="table-content">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.orderHistory.map((order, index) => (
                    <tr key={index}>
                      <td className="order-id">#{order.id}</td>
                      <td className="customer">John Doe</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="amount">{formatCurrency(1234)}</td>
                      <td className="date">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">Top Products</h3>
              <button className="view-all-btn">View All</button>
            </div>
            <div className="table-content">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Sales</th>
                    <th>Revenue</th>
                    <th>Trend</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="product">
                      <div className="product-info">
                        <div className="product-name">Healthcare Kit A</div>
                        <div className="product-category">Medical Supplies</div>
                      </div>
                    </td>
                    <td className="sales">{formatNumber(156)}</td>
                    <td className="revenue">{formatCurrency(12450)}</td>
                    <td className="trend up">↗ +12%</td>
                  </tr>
                  <tr>
                    <td className="product">
                      <div className="product-info">
                        <div className="product-name">Medicine Pack B</div>
                        <div className="product-category">Pharmaceuticals</div>
                      </div>
                    </td>
                    <td className="sales">{formatNumber(98)}</td>
                    <td className="revenue">{formatCurrency(8920)}</td>
                    <td className="trend up">↗ +8%</td>
                  </tr>
                  <tr>
                    <td className="product">
                      <div className="product-info">
                        <div className="product-name">Equipment Set C</div>
                        <div className="product-category">Medical Equipment</div>
                      </div>
                    </td>
                    <td className="sales">{formatNumber(67)}</td>
                    <td className="revenue">{formatCurrency(15680)}</td>
                    <td className="trend down">↘ -3%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Locale Demo Section */}
      <div className="locale-demo-section">
        <LocaleDemo />
      </div>

      {/* Currency Demo Section */}
      <div className="currency-demo-section">
        <CurrencyDemo />
      </div>

    </div>
  );
};

export default Dashboard;
