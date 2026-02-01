import React, { useEffect, useState } from 'react';
import { metadataService, type MailTemplate } from '../../services/metadataService';
import './Dispense.css';

const Dispense: React.FC = () => {
  // Mail template configuration state for DISPENSED only
  const [mailTemplate, setMailTemplate] = useState<MailTemplate>({
    fromMail: '',
    secretKey: '',
    title: '',
    content: '',
    status: 'DISPENSED',
  });
  const [mailLoading, setMailLoading] = useState<boolean>(false);
  const [mailSaving, setMailSaving] = useState<boolean>(false);
  const [mailError, setMailError] = useState<string | null>(null);

  // Load configured mail template
  const loadMailTemplate = async () => {
    try {
      setMailLoading(true);
      setMailError(null);
      const data = await metadataService.getMailInfo();

      // Handle different response formats
      if (Array.isArray(data)) {
        // If it's an array, find template by status
        const dispensedTemplate = data.find((t: any) => t.status === 'DISPENSED');

        if (dispensedTemplate) {
          setMailTemplate({
            fromMail: dispensedTemplate.fromMail || '',
            secretKey: dispensedTemplate.secretKey || '',
            title: dispensedTemplate.title || '',
            content: dispensedTemplate.content || '',
            status: 'DISPENSED',
          });
        }
      } else if (data && typeof data === 'object') {
        // If it's an object, check for direct properties
        if (data.DISPENSED) {
          setMailTemplate({
            fromMail: data.DISPENSED.fromMail || '',
            secretKey: data.DISPENSED.secretKey || '',
            title: data.DISPENSED.title || '',
            content: data.DISPENSED.content || '',
            status: 'DISPENSED',
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
      setMailSaving(true);
      setMailError(null);

      const template = mailTemplate;
      // Remove status from payload as it's in the URL
      const { status: _, ...payload } = template;

      await metadataService.configureMailInfo('DISPENSED', payload);

      // Reload mail template from server after successful save
      await loadMailTemplate();

      alert('Dispense mail template updated successfully.');
    } catch (error) {
      console.error('Failed to save mail template:', error);
      const message =
        error instanceof Error ? error.message : 'Failed to save mail template';
      setMailError(message);
      alert(message);
    } finally {
      setMailSaving(false);
    }
  };

  return (
    <div className="dispense-container">
      <div className="dispense-header">
        <div className="header-icon">📦</div>
        <h1>Dispense Mail Configuration</h1>
        <p>Configure email template that will be sent when prescriptions are dispensed</p>
      </div>

      <div className="dispense-content">
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon">✉️</div>
            <div className="card-title-group">
              <h2>DISPENSED Prescription Email Template</h2>
              <p className="card-subtitle">
                Configure the email that will be automatically sent to customers when their prescription is dispensed
              </p>
            </div>
          </div>

          {mailLoading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading mail template...</p>
            </div>
          )}

          {mailError && (
            <div className="error-alert">
              <span className="error-icon">⚠️</span>
              <p>{mailError}</p>
            </div>
          )}

          {!mailLoading && (
            <div className="form-body">
              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="dispense-from-mail">
                    <span className="label-icon">📧</span>
                    From Email
                  </label>
                  <input
                    id="dispense-from-mail"
                    type="email"
                    className="form-input"
                    value={mailTemplate.fromMail}
                    onChange={(e) => handleMailChange('fromMail', e.target.value)}
                    placeholder="e.g., inceptionfirm@gmail.com"
                  />
                  <span className="field-hint">Email address that will send the dispensed notification</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="dispense-secret-key">
                    <span className="label-icon">🔐</span>
                    Secret Key
                  </label>
                  <input
                    id="dispense-secret-key"
                    type="password"
                    className="form-input"
                    value={mailTemplate.secretKey}
                    onChange={(e) => handleMailChange('secretKey', e.target.value)}
                    placeholder="e.g., tgrgmtvaphfnezlx"
                  />
                  <span className="field-hint">Email service secret key (e.g., Gmail app password)</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="dispense-title">
                    <span className="label-icon">📝</span>
                    Email Title / Subject
                  </label>
                  <input
                    id="dispense-title"
                    type="text"
                    className="form-input"
                    value={mailTemplate.title}
                    onChange={(e) => handleMailChange('title', e.target.value)}
                    placeholder="e.g., Your Prescription Has Been Dispensed"
                  />
                  <span className="field-hint">Subject line for the dispensed email</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field full-width">
                  <label htmlFor="dispense-content">
                    <span className="label-icon">📄</span>
                    Email Content
                  </label>
                  <textarea
                    id="dispense-content"
                    className="form-textarea"
                    rows={8}
                    value={mailTemplate.content}
                    onChange={(e) => handleMailChange('content', e.target.value)}
                    placeholder="Enter the email body content here..."
                  />
                  <span className="field-hint">Body content of the dispensed email</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="save-btn primary"
                  onClick={handleMailSave}
                  disabled={mailSaving}
                >
                  {mailSaving ? (
                    <>
                      <span className="btn-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      Save Dispense Template
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dispense;
