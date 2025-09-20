import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useConfig } from '../../contexts/ConfigContext';
import { useLocale } from '../../contexts/LocaleContext';
import { LoginProps } from '../../types';
import './Login.css';

const Login: React.FC<LoginProps> = () => {
  const { login, loading } = useAuth();
  const { config } = useConfig();
  const { t } = useLocale();
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
    general?: string;
  }>({});
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Demo credentials for easy testing
  const demoCredentials = [
    { email: 'admin@flycanary.com', password: 'admin123', role: 'Admin' },
    { email: 'user@flycanary.com', password: 'user123', role: 'User' },
    { email: 'demo@flycanary.com', password: 'demo123', role: 'Demo' }
  ];

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
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem('flycanary_remembered_email', formData.email);
        } else {
          localStorage.removeItem('flycanary_remembered_email');
        }
        
        // Login successful - the App component will automatically redirect to dashboard
        // No need for manual redirect as the auth context will trigger re-render
      } else {
        setErrors({ general: result.error || t('login.loginFailed') });
      }
    } catch (error) {
      setErrors({ general: t('login.unexpectedError') });
    }
  };

  const fillDemoCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    setErrors({});
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
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
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

        <div className="demo-credentials">
          <h4>Demo Credentials</h4>
          <div className="demo-buttons">
            {demoCredentials.map((cred, index) => (
              <button
                key={index}
                type="button"
                className="demo-button"
                onClick={() => fillDemoCredentials(cred.email, cred.password)}
                disabled={loading}
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a href="#" className="signup-link">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
