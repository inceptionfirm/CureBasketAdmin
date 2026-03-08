import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocale } from '../../contexts/LocaleContext';
// import { metadataService, type MailTemplate } from '../../services/metadataService';
import './Settings.css';

/* Commented out - restore imports/state/handlers if re-enabling sections below:
import { useEffect, useState } from 'react';
const [settings, setSettings] = useState({ notifications: true, emailNotifications: true, pushNotifications: false, autoSave: true });
const [mailTemplate, setMailTemplate] = useState<MailTemplate>({ fromMail: '', secretKey: '', title: '', content: '', status: 'APPROVE' });
const [mailLoading, setMailLoading] = useState(false);
const [mailSaving, setMailSaving] = useState({ APPROVE: false });
const [mailError, setMailError] = useState<string | null>(null);
const handleToggle = (key: string) => setSettings(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
const loadMailTemplate = async () => { ... };
useEffect(() => { loadMailTemplate(); }, []);
const handleMailChange = (field, value) => setMailTemplate(prev => ({ ...prev, [field]: value }));
const handleMailSave = async () => { ... };
const handleSave = () => { ... };
const handleReset = () => { setSettings({...}); setTheme('light'); setLocale('US'); ... };
*/

const Settings: React.FC = () => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  const { locale, formatCurrency, formatDate, t } = useLocale();

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

        {/* Prescription Approval Mail Template - commented out, uncomment to restore
        <div className="settings-section">
          <h2>Prescription Approval Mail Template</h2>
          <p className="settings-section-description">
            Configure email template that will be sent when prescriptions are approved.
            This email is sent automatically to customers. (Dispense configuration is in the Dispense section)
          </p>
          <div className="settings-group">
            <div className="mail-template-section">
              <h3>APPROVE Prescription Template</h3>
              <div className="setting-item">
                <div className="setting-info"><h4>From Email</h4><p>Email address that will send the approval notification</p></div>
                <input type="email" className="setting-input" placeholder="e.g., inceptionfirm@gmail.com" />
              </div>
              <div className="setting-item">
                <div className="setting-info"><h4>Secret Key</h4><p>Email service secret key (e.g., Gmail app password)</p></div>
                <input type="password" className="setting-input" placeholder="e.g., tgrgmtvaphfnezlx" />
              </div>
              <div className="setting-item">
                <div className="setting-info"><h4>Email Title</h4><p>Subject line for the approval email</p></div>
                <input type="text" className="setting-input" placeholder="e.g., Your Prescription Has Been Approved" />
              </div>
              <div className="setting-item">
                <div className="setting-info"><h4>Email Content</h4><p>Body content of the approval email</p></div>
                <textarea className="setting-textarea" rows={6} placeholder="Enter the email body content here..." />
              </div>
              <div className="settings-actions">
                <button className="save-settings-btn">Save APPROVE Template</button>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Notifications - commented out, uncomment to restore
        <div className="settings-section">
          <h2>{t('settings.notifications')}</h2>
          <div className="settings-group">
            <div className="setting-item">
              <div className="setting-info"><h3>{t('settings.enableNotifications')}</h3><p>Receive notifications for important updates</p></div>
              <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
            <div className="setting-item">
              <div className="setting-info"><h3>{t('settings.emailNotifications')}</h3><p>Receive notifications via email</p></div>
              <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
            <div className="setting-item">
              <div className="setting-info"><h3>{t('settings.pushNotifications')}</h3><p>Receive push notifications in browser</p></div>
              <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
            <div className="setting-item">
              <div className="setting-info"><h3>{t('settings.autoSave')}</h3><p>Automatically save changes</p></div>
              <label className="toggle-switch"><input type="checkbox" /><span className="toggle-slider"></span></label>
            </div>
          </div>
        </div>
        */}

        {/* Save Settings / Reset to Default - commented out, uncomment to restore
        <div className="settings-actions">
          <button className="save-settings-btn">{t('settings.save')}</button>
          <button className="reset-settings-btn">{t('settings.reset')}</button>
        </div>
        */}
      </div>
    </div>
  );
};

export default Settings;
