import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';
import { countries } from '../../data/countries';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const { locale, setLocale, formatCurrency, formatDate, formatNumber, t } = useLocale();
  
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true
  });

  const [countrySearch, setCountrySearch] = useState<string>('');
  
  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const handleToggle = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSelect = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Settings saved:', { ...settings, theme, isDark });
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    setSettings({
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
      autoSave: true
    });
    setTheme('light');
    setLocale('US');
    alert('Settings reset to default!');
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>{t('settings.appearance')}</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.theme')}</h3>
                <p>Choose your preferred theme</p>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'auto')}
                className="setting-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.quickToggle')}</h3>
                <p>Quickly switch between light and dark mode</p>
              </div>
              <button 
                className="theme-toggle-btn"
                onClick={toggleTheme}
              >
                {isDark ? '☀️ Switch to Light' : '🌙 Switch to Dark'}
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.currentTheme')}</h3>
                <p>Currently using: {isDark ? 'Dark' : 'Light'} theme</p>
              </div>
              <div className="theme-preview">
                <div className={`theme-preview-box ${isDark ? 'dark' : 'light'}`}>
                  <div className="theme-preview-header"></div>
                  <div className="theme-preview-content"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t('settings.general')}</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.country')}</h3>
                <p>Select your country to auto-configure language, currency, and timezone</p>
              </div>
              <div className="country-selector">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  className="country-search"
                />
                <select
                  value={locale.country}
                  onChange={(e) => setLocale(e.target.value)}
                  className="setting-select"
                >
                  {filteredCountries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.language')}</h3>
                <p>Current: {locale.language.toUpperCase()}</p>
              </div>
              <div className="locale-display">
                <span className="locale-info">{locale.language.toUpperCase()}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.currency')}</h3>
                <p>Current: {locale.currency} ({locale.currencySymbol})</p>
              </div>
              <div className="locale-display">
                <span className="locale-info">{formatCurrency(1234.56)}</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.timezone')}</h3>
                <p>Current: {locale.timezone}</p>
              </div>
              <div className="locale-display">
                <span className="locale-info">{formatDate(new Date())}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>{t('settings.notifications')}</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.enableNotifications')}</h3>
                <p>Receive notifications for important updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={() => handleToggle('notifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.emailNotifications')}</h3>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  disabled={!settings.notifications}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.pushNotifications')}</h3>
                <p>Receive push notifications in browser</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                  disabled={!settings.notifications}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <h3>{t('settings.autoSave')}</h3>
                <p>Automatically save changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={() => handleToggle('autoSave')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="save-settings-btn" onClick={handleSave}>
            {t('settings.save')}
          </button>
          <button className="reset-settings-btn" onClick={handleReset}>
            {t('settings.reset')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
