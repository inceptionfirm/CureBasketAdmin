import React, { useEffect, useState } from 'react';
import './Dispense.css';
import apiClient from '../../services/apiClient';

type MailTemplate = {
  fromMail: string;
  mailSecretKey: string;
  title: string;
  content: string;
  placeHolders: string;
  serviceType: string;
  serviceStatus: string;
};

const SERVICE_TYPES = ['PRESCRIPTION', 'ORDER'];

const STATUS_MAP: Record<string, string[]> = {
  PRESCRIPTION: ['APPROVED', 'DISPENSED'],
  ORDER: ['PURCHASED', 'SHIPPED'],
};

const Dispense: React.FC = () => {
  const [serviceType, setServiceType] = useState('PRESCRIPTION');
  const [serviceStatus, setServiceStatus] = useState('DISPENSED');

  const [mailTemplate, setMailTemplate] = useState<MailTemplate>({
    fromMail: '',
    mailSecretKey: '',
    title: '',
    content: '',
    serviceType: 'PRESCRIPTION',
    serviceStatus: 'DISPENSED',
    placeHolders: `<customerName>`
  });

  const [mailLoading, setMailLoading] = useState(false);
  const [mailSaving, setMailSaving] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);

  // ✅ Load template (triggered only when dropdown changes)
  useEffect(() => {
    const load = async () => {
      try {
        setMailLoading(true);
        setMailError(null);

        const res = await apiClient.get(
          `/mail-info/${serviceType}/${serviceStatus}`
        );

        if (!res.success) throw new Error(res.error);

        const data = res.data || {};

        setMailTemplate({
          fromMail: data.fromMail || '',
          mailSecretKey: data.mailSecretKey || '',
          title: data.title || '',
          content: data.content || '',
          serviceType,
          serviceStatus,
          placeHolders: data.placeHolders || `<customerName>`,
        });

        console.log("this is the mailTemplate",mailTemplate);
        
      } catch (err: any) {
        console.error(err);
        setMailError(err.message || 'Failed to load template');

        // reset fields if not found
        setMailTemplate(prev => ({
          ...prev,
          fromMail: '',
          mailSecretKey: '',
          title: '',
          content: '',
        }));
      } finally {
        setMailLoading(false);
      }
    };

    load();
  }, [serviceType, serviceStatus]);

  const handleChange = (field: keyof MailTemplate, value: string) => {
    setMailTemplate(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // ✅ Save template
  const handleSave = async () => {
    try {
      setMailSaving(true);
      setMailError(null);

      const payload = {
        ...mailTemplate,
        serviceType,
        serviceStatus,
      };

      const res = await apiClient.post('/mail-info', payload);

      if (!res.success) throw new Error(res.error);

      alert('Template saved successfully');
    } catch (err: any) {
      console.error(err);
      setMailError(err.message || 'Failed to save');
    } finally {
      setMailSaving(false);
    }
  };

  const currentStatuses = STATUS_MAP[serviceType];

  return (
    <div className="dispense-container">
      <div className="dispense-header">
        <div className="header-icon">📦</div>
        <h1>Mail Configuration</h1>
        <p>
          Configure email template that will be sent to customer on different occasions
        </p>
      </div>

      <div className="dispense-content">
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon">✉️</div>
            <div className="card-title-group">
              <h2>Email Template</h2>
              <p className="card-subtitle">
                Configure the email based on service and status
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

              {/* ✅ Service Dropdown */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>Service Type</label>
                  <select
                    className="form-input"
                    value={serviceType}
                    onChange={(e) => {
                      const newService = e.target.value;
                      setServiceType(newService);
                      setServiceStatus(STATUS_MAP[newService][0]);
                    }}
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ✅ Status Dropdown */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>Status</label>
                  <select
                    className="form-input"
                    value={serviceStatus}
                    onChange={(e) => setServiceStatus(e.target.value)}
                  >
                    {currentStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* From Email */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>From Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={mailTemplate.fromMail}
                    onChange={(e) =>
                      handleChange('fromMail', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Secret Key */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>Secret Key</label>
                  <input
                    type="password"
                    className="form-input"
                    value={mailTemplate.mailSecretKey}
                    onChange={(e) =>
                      handleChange('mailSecretKey', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Title */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>Email Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    value={mailTemplate.title}
                    onChange={(e) =>
                      handleChange('title', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Content */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>Email Content</label>
                  <textarea
                    className="form-textarea"
                    rows={8}
                    value={mailTemplate.content}
                    onChange={(e) =>
                      handleChange('content', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* PlaceHolder */}
              <div className="form-row">
                <div className="form-field full-width">
                  <label>PlaceHolder</label>
                  <p
                    className="form-input">
                  
                    {mailTemplate.placeHolders}
                    </p>
                    
                 
                </div>
              </div>

              {/* Save */}
              <div className="card-actions">
                <button
                  className="save-btn primary"
                  onClick={handleSave}
                  disabled={mailSaving}
                >
                  {mailSaving ? (
                    <>
                      <span className="btn-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      💾 Save Template
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