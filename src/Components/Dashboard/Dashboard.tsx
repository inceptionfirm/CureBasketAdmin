import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../contexts/DashboardContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useLocale } from '../../contexts/LocaleContext';
import CategoryCard from './CategoryCard';
import ProgressChart from './ProgressChart';
import LineChart from './LineChart';
import DonutChart from './DonutChart';
import LocaleDemo from './LocaleDemo';
import CurrencyDemo from './CurrencyDemo';
import categoryService from '../../services/categoryService';
import dashboardService from '../../services/dashboardService';
import { Category } from '../../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { config: dashboardConfig } = useDashboard();
  const { config: appConfig } = useConfig();
  const { formatCurrency, formatDate, formatNumber, t } = useLocale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('August');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('7 days');
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [dashboardData, setDashboardData] = useState<{
    ordersCompleted: number;
    buyers: number;
    revenue: string;
    orderHistory: Array<{
      id: string;
      status: string;
      date: string;
    }>;
  } | null>(null);

  // Real-time date/time update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all dashboard data in parallel
        const [categoriesResponse, metricsResponse, orderHistoryResponse] = await Promise.all([
          categoryService.getCategories(),
          dashboardService.getDashboardMetrics(selectedTimeframe),
          dashboardService.getOrderHistory()
        ]);
        
        // Filter only active categories with active elements
        const activeCategories = categoriesResponse.filter(category => 
          category.isActive && 
          category.elements.some(element => element.isActive)
        );
        
        setCategories(activeCategories);
        
        // Set dashboard metrics
        setDashboardData({
          ordersCompleted: metricsResponse.totalOrders,
          buyers: metricsResponse.totalBuyers,
          revenue: formatCurrency(metricsResponse.totalRevenue),
          orderHistory: orderHistoryResponse.map(order => ({
            id: order.id,
            status: order.status,
            date: order.date
          }))
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeframe]);

  const handleElementToggle = async (categoryId: number, elementId: number) => {
    try {
      // Find the category and element to get current status
      const category = categories.find(cat => cat.id === categoryId);
      if (!category) return;
      
      const element = category.elements.find(el => el.id === elementId);
      if (!element) return;
      
      // Toggle the element status
      const newStatus = !element.isActive;
      
      // Update backend
      await categoryService.toggleElementStatus(categoryId, elementId, newStatus);
      
      // Update local state
      setCategories(prevCategories => 
        prevCategories.map(cat => 
          cat.id === categoryId 
            ? {
                ...cat,
                elements: cat.elements.map(el => 
                  el.id === elementId 
                    ? { ...el, isActive: newStatus }
                    : el
                )
              }
            : cat
        ).filter(cat => 
          cat.isActive && cat.elements.some(el => el.isActive)
        )
      );
    } catch (error) {
      console.error('Error toggling element:', error);
      setError('Failed to update element status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  // Sample data for charts
  const progressData = [
    { title: 'System Performance', value: 87, max: 100, color: '#10b981' },
    { title: 'User Engagement', value: 72, max: 100, color: '#3b82f6' },
    { title: 'Task Completion', value: 94, max: 100, color: '#f59e0b' },
    { title: 'Revenue Growth', value: 68, max: 100, color: '#8b5cf6' }
  ];

  const trendData = [
    { x: 1, y: 45, label: 'Jan' },
    { x: 2, y: 52, label: 'Feb' },
    { x: 3, y: 48, label: 'Mar' },
    { x: 4, y: 61, label: 'Apr' },
    { x: 5, y: 55, label: 'May' },
    { x: 6, y: 67, label: 'Jun' },
    { x: 7, y: 72, label: 'Jul' }
  ];

  const activeElements = categories.reduce((total, cat) => 
    total + cat.elements.filter(el => el.isActive).length, 0
  );

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
            <div className="metric-value">{dashboardData ? formatNumber(dashboardData.ordersCompleted) : '...'}</div>
            <div className="metric-label">{t('dashboard.ordersCompleted')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{dashboardData ? formatNumber(dashboardData.buyers) : '...'}</div>
            <div className="metric-label">{t('dashboard.activeBuyers')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{dashboardData ? dashboardData.revenue : '...'}</div>
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
                  {dashboardData ? (
                    dashboardData.orderHistory.map((order, index) => (
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="loading-cell">
                        Loading recent orders...
                      </td>
                    </tr>
                  )}
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
