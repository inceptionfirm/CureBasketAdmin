import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import dashboardService, { DashboardStats } from '../../services/dashboardService';
import { Prescription } from '../../services/prescriptionService';
import RecentPrescriptions from './RecentPrescriptions';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { formatCurrency, formatDate, formatNumber, t } = useLocale();
  
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderHistory] = useState([
    { id: '1', status: 'completed' as const, date: '2024-01-20', amount: 1234, customerName: 'John Doe' },
    { id: '2', status: 'pending' as const, date: '2024-01-19', amount: 567, customerName: 'Jane Smith' },
    { id: '3', status: 'completed' as const, date: '2024-01-18', amount: 890, customerName: 'Bob Johnson' },
    { id: '4', status: 'processing' as const, date: '2024-01-17', amount: 1234, customerName: 'Alice Brown' },
    { id: '5', status: 'completed' as const, date: '2024-01-16', amount: 567, customerName: 'Charlie Wilson' },
  ]);
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(true);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const dashboardStats = await dashboardService.getDashboardStats();
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch recent prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setPrescriptionsLoading(true);
        const prescriptions = await dashboardService.getRecentPrescriptions(5);
        setRecentPrescriptions(prescriptions);
      } catch (error) {
        console.error('Error fetching recent prescriptions:', error);
      } finally {
        setPrescriptionsLoading(false);
      }
    };

    fetchPrescriptions();
  }, []);

  // Real-time date/time update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Dashboard Header */}
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

      {/* System Stats - Dynamic Data from Backend */}
      <div className="metrics-section">
        <h3 className="section-title">System Overview</h3>
        <div className="metrics-grid">
          {loading ? (
            <div className="loading-placeholder">Loading statistics...</div>
          ) : stats ? (
            <>
              <div className="metric-card stat-card">
                <div className="stat-icon">📁</div>
                <div className="stat-content">
                  <div className="metric-value">{formatNumber(stats.categories.total)}</div>
                  <div className="metric-label">Total Categories</div>
                  <div className="stat-sublabel">{stats.categories.active} Active</div>
                </div>
              </div>
              <div className="metric-card stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="metric-value">{formatNumber(stats.users.total)}</div>
                  <div className="metric-label">Total Users</div>
                  <div className="stat-sublabel">System Users</div>
                </div>
              </div>
              <div className="metric-card stat-card">
                <div className="stat-icon">💊</div>
                <div className="stat-content">
                  <div className="metric-value">{formatNumber(stats.medicines.total)}</div>
                  <div className="metric-label">Medicines</div>
                  <div className="stat-sublabel">Available Items</div>
                </div>
              </div>
              <div className="metric-card stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <div className="metric-value">{formatNumber(stats.prescriptions.total)}</div>
                  <div className="metric-label">Prescriptions</div>
                </div>
              </div>
              <div className="metric-card stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <div className="metric-value">{formatNumber(stats.blogs.total)}</div>
                  <div className="metric-label">Blogs</div>
                  <div className="stat-sublabel">Published Articles</div>
                </div>
              </div>
            </>
          ) : (
            <div className="error-placeholder">Failed to load statistics</div>
          )}
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Revenue Trend</h3>
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
      </div>

      {/* Recent Prescriptions Section */}
      <div className="tables-section">
        <div className="table-container">
          <div className="table-header">
            <h3 className="table-title">Recent Prescriptions</h3>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="table-content">
            <RecentPrescriptions 
              prescriptions={recentPrescriptions} 
              loading={prescriptionsLoading}
            />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="tables-section">
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
                {orderHistory.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id}</td>
                    <td className="customer">{order.customerName}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="amount">{formatCurrency(order.amount)}</td>
                    <td className="date">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
