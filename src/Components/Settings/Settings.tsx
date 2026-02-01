import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';
import { countries } from '../../data/countries';
import { metadataService, type MailTemplate } from '../../services/metadataService';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const { locale, setLocale, formatCurrency, formatDate, t } = useLocale();

  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    pushNotifications: false,
    autoSave: true
  });

  const [countrySearch, setCountrySearch] = useState<string>('');

  // Mail template configuration state (only APPROVE, DISPENSED moved to separate page)
  const [mailTemplate, setMailTemplate] = useState<MailTemplate>({
    fromMail: '',
    secretKey: '',
    title: '',
    content: '',
    status: 'APPROVE',
  });
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailSaving, setMailSaving] = useState<{ APPROVE: boolean }>({ APPROVE: false });
  const [mailError, setMailError] = useState<string | null>(null);

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

  // Load configured mail template (only APPROVE)
  const loadMailTemplate = async () => {
    try {
      setMailLoading(true);
      setMailError(null);
      const data = await metadataService.getMailInfo();

      // Handle different response formats
      if (Array.isArray(data)) {
        // If it's an array, find template by status
        const approveTemplate = data.find((t: any) => t.status === 'APPROVE' || t.status === 'APPROVED');

        if (approveTemplate) {
          setMailTemplate({
            fromMail: approveTemplate.fromMail || '',
            secretKey: approveTemplate.secretKey || '',
            title: approveTemplate.title || '',
            content: approveTemplate.content || '',
            status: 'APPROVE',
          });
        }
      } else if (data && typeof data === 'object') {
        // If it's an object, check for direct properties
        if (data.APPROVE) {
          setMailTemplate({
            fromMail: data.APPROVE.fromMail || '',
            secretKey: data.APPROVE.secretKey || '',
            title: data.APPROVE.title || '',
            content: data.APPROVE.content || '',
            status: 'APPROVE',
          });
        }
      }
    } catch (error) {
      console.error('Failed to load mail template:', error);
      setMailError(
        error instanceof Error ? error.message : 'Failed to load mail template'
      );
    } finally {
      setMailLoading(false);
    }
  };

  useEffect(() => {
    loadMailTemplate();
  }, []);

  const handleMailChange = (field: keyof MailTemplate, value: string) => {
    setMailTemplate(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMailSave = async () => {
    try {
      setMailSaving({ APPROVE: true });
      setMailError(null);

      const template = mailTemplate;
      // Remove status from payload as it's in the URL
      const { status: _, ...payload } = template;

      await metadataService.configureMailInfo('APPROVE', payload);

      // Reload mail template from server after successful save
      await loadMailTemplate();

      alert('Mail template for APPROVE updated successfully.');
    } catch (error) {
      console.error('Failed to save mail template:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save mail template';
      setMailError(message);
      alert(message);
    } finally {
      setMailSaving({ APPROVE: false });
    }
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

        {/* Admin-only: Mail Template Configuration for Prescription Statuses */}
        <div className="settings-section">
          <h2>Prescription Approval Mail Template</h2>
          <p className="settings-section-description">
            Configure email template that will be sent when prescriptions are approved.
            This email is sent automatically to customers. (Dispense configuration is in the Dispense section)
          </p>
          <div className="settings-group">
            {mailLoading && (
              <div className="setting-item">
                <p>Loading mail templates...</p>
              </div>
            )}
            {mailError && (
              <div className="setting-item bank-error">
                <p>{mailError}</p>
              </div>
            )}

            {/* APPROVE Template */}
            <div className="mail-template-section">
              <h3>APPROVE Prescription Template</h3>
              <div className="setting-item">
                <div className="setting-info">
                  <h4>From Email</h4>
                  <p>Email address that will send the approval notification</p>
                </div>
                <input
                  type="email"
                  className="setting-input"
                  value={mailTemplate.fromMail}
                  onChange={(e) => handleMailChange('fromMail', e.target.value)}
                  placeholder="e.g., inceptionfirm@gmail.com"
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Secret Key</h4>
                  <p>Email service secret key (e.g., Gmail app password)</p>
                </div>
                <input
                  type="password"
                  className="setting-input"
                  value={mailTemplate.secretKey}
                  onChange={(e) => handleMailChange('secretKey', e.target.value)}
                  placeholder="e.g., tgrgmtvaphfnezlx"
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Title</h4>
                  <p>Subject line for the approval email</p>
                </div>
                <input
                  type="text"
                  className="setting-input"
                  value={mailTemplate.title}
                  onChange={(e) => handleMailChange('title', e.target.value)}
                  placeholder="e.g., Your Prescription Has Been Approved"
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <h4>Email Content</h4>
                  <p>Body content of the approval email</p>
                </div>
                <textarea
                  className="setting-textarea"
                  rows={6}
                  value={mailTemplate.content}
                  onChange={(e) => handleMailChange('content', e.target.value)}
                  placeholder="Enter the email body content here..."
                />
              </div>

              <div className="settings-actions">
                <button
                  className="save-settings-btn"
                  onClick={handleMailSave}
                  disabled={mailSaving.APPROVE}
                >
                  {mailSaving.APPROVE ? 'Saving...' : 'Save APPROVE Template'}
                </button>
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
