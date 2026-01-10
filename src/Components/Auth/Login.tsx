import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useLocale } from '../../contexts/LocaleContext';
import { LoginProps } from '../../types';
import './Login.css';
import SuperAdminModal from './SuperAdminModal';

const Login: React.FC<LoginProps> = () => {
  const { login, loading } = useAuth();
  const { config } = useConfig();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
  }>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuperAdminModal, setShowSuperAdminModal] = useState<boolean>(false);

  useEffect(() => {
    // Load saved credentials if remember me was checked
    const savedEmail = localStorage.getItem('flycanary_remembered_email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
    } = {};

    if (!formData.email) {
      newErrors.email = t('login.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('login.emailInvalid');
    }

    if (!formData.password) {
      newErrors.password = t('login.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('login.passwordMinLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setGeneralError(null);
      setSuccessMessage(null);
      return;
    }

    try {
      setGeneralError(null);
      setSuccessMessage(null);
      const result = await login(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('flycanary_remembered_email', formData.email);
        } else {
          localStorage.removeItem('flycanary_remembered_email');
        }
        
        // Determine redirect URL (priority order):
        // 1. Redirect URL from backend response
        // 2. Saved redirect from sessionStorage (if user was trying to access a protected route)
        // 3. Default to dashboard
        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
        const redirectUrl = result.redirectUrl || 
                           savedRedirect || 
                           '/dashboard';
        
        // Clear saved redirect
        if (savedRedirect) {
          sessionStorage.removeItem('redirectAfterLogin');
        }
        
        console.log('🔀 Redirecting to:', redirectUrl);
        
        // Small delay to ensure auth state is updated, then navigate
        setTimeout(() => {
          navigate(redirectUrl, { replace: true });
        }, 100);
      } else {
        setGeneralError(result.error || t('login.loginFailed'));
      }
    } catch (error) {
      setGeneralError(t('login.unexpectedError'));
    }
  };

  const handleSuperAdminSuccess = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setShowSuperAdminModal(false);
    setErrors({});
    setSuccessMessage('Super admin created successfully. Use your credentials to sign in.');
    setGeneralError(null);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img 
              src={config.brand.logo} 
              alt={config.brand.name} 
              className="logo-image"
            />
          </div>
          <p className="login-subtitle">{config.auth.loginPage.title}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {generalError && (
            <div className="error-message general-error">
              {generalError}
            </div>
          )}

          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder={t('login.emailPlaceholder')}
              disabled={loading}
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder={t('login.passwordPlaceholder')}
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <span className="checkmark"></span>
              Remember me
            </label>
            <a href="#" className="forgot-password">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <div className="button-loading">
                <div className="spinner"></div>
                Signing in...
              </div>
            ) : (
              t('login.signIn')
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="signup-link"
              onClick={() => setShowSuperAdminModal(true)}
            >
              Sign up here
            </button>
          </p>
        </div>
      </div>

      <SuperAdminModal
        isOpen={showSuperAdminModal}
        onClose={() => setShowSuperAdminModal(false)}
        onSuccess={handleSuperAdminSuccess}
      />
    </div>
  );
};

export default Login;
