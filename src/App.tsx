import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { DashboardProvider } from './contexts/DashboardContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LocaleProvider } from './contexts/LocaleContext';
import Login from './Components/Auth/Login';
import SideBar from './Components/SideBar/SideBar';
import Header from './Components/Header/Header';
import Dashboard from './Components/Dashboard/Dashboard';
import Profile from './Components/Profile/Profile';
import Settings from './Components/Settings/Settings';
import BankContact from './Components/BankContact/BankContact';
import Dispense from './Components/Dispense/Dispense';
import Users from './Components/Users/Users';
import Categories from './Components/Categories/Categories';
import Blogs from './Components/Blogs/Blogs';
import BannerManagement from './Components/BannerManagement/BannerManagement';
import Prescriptions from './Components/Prescriptions/Prescriptions';
import MedicinePage from './Components/Medicine/MedicinePage';
import Permissions from './Components/Permissions/Permissions';
import PermissionGroups from './Components/PermissionGroups/PermissionGroups';
import Roles from './Components/Roles/Roles';
import Footer from './Components/Footer/Footer';
import GlobalThemeWrapper from './Components/GlobalThemeWrapper';
import './App.css';
import './styles/dynamic.css';
import './styles/dashboard.css';
import './styles/admin-panel.css';
import './styles/pages.css';

function AdminLayout(): React.JSX.Element {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth > 1024);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth <= 1024 && sidebarOpen) {
        const sidebar = document.querySelector('.admin-sidebar');
        const toggleButton = document.querySelector('.admin-header-btn');
        
        if (sidebar && !sidebar.contains(event.target as Node) && 
            toggleButton && !toggleButton.contains(event.target as Node)) {
          setSidebarOpen(false);
        }
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleViewChange = (view: string) => {
    navigate(`/${view}`);
    
    if (window.innerWidth <= 1024) {
      setSidebarOpen(false);
    }
  };


  return (
    <div 
      className={`admin-panel ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}
      onClick={(e) => {
        if (window.innerWidth <= 1024 && sidebarOpen && e.target === e.currentTarget) {
          setSidebarOpen(false);
        }
      }}
    >
      <SideBar 
        currentView={location.pathname.substring(1) || 'dashboard'} 
        onViewChange={handleViewChange} 
        isOpen={sidebarOpen}
      />
      <Header 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleViewChange}
        user={{ name: 'Admin User', email: 'admin@curebasket.com', role: 'admin' }}
      />
      <div className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/blogs" element={<Blogs />} />
          <Route path="/banner-management" element={<BannerManagement />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/medicine" element={<MedicinePage />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/permission-groups" element={<PermissionGroups />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bank-contact" element={<BankContact />} />
          <Route path="/dispense" element={<Dispense />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      {/* <Footer sidebarOpen={sidebarOpen} /> */}
      {/* <ConfigManager /> */} {/* Commented out for now - will use in header later */}
    </div>
  )
}

function AppContent(): React.JSX.Element {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Show login page if not authenticated
  // If user is trying to access a protected route, save it for redirect after login
  if (!isAuthenticated) {
    // Save the intended destination if it's not the login page
    if (location.pathname !== '/login' && location.pathname !== '/') {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
    return <Login />
  }

  // Show admin panel if authenticated
  return <AdminLayout />
}

function App(): React.JSX.Element {
  return (
    <Router>
      <LocaleProvider>
        <ThemeProvider>
          <ConfigProvider>
            <DashboardProvider clientId="curebasket-healthcare">
              <AuthProvider>
                <GlobalThemeWrapper>
                  <AppContent />
                </GlobalThemeWrapper>
              </AuthProvider>
            </DashboardProvider>
          </ConfigProvider>
        </ThemeProvider>
      </LocaleProvider>
    </Router>
  )
}

export default App