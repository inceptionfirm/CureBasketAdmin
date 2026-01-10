import React from 'react';
import { Prescription, PrescriptionMainAttribute } from '../../services/prescriptionService';
import './RecentPrescriptions.css';

interface RecentPrescriptionsProps {
  prescriptions: Prescription[];
  loading?: boolean;
}

const RecentPrescriptions: React.FC<RecentPrescriptionsProps> = ({ prescriptions, loading = false }) => {
  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'status-badge pending';
    const statusLower = status.toLowerCase();
    if (statusLower === 'approved') return 'status-badge approved';
    if (statusLower === 'pending') return 'status-badge pending';
    if (statusLower === 'rejected') return 'status-badge rejected';
    if (statusLower === 'dispensed') return 'status-badge dispensed';
    if (statusLower === 'expired') return 'status-badge expired';
    return 'status-badge pending';
  };

  const getPriorityBadgeClass = (priority?: string) => {
    if (!priority) return 'priority-badge medium';
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'priority-badge high';
    if (priorityLower === 'medium') return 'priority-badge medium';
    if (priorityLower === 'low') return 'priority-badge low';
    return 'priority-badge medium';
  };

  if (loading) {
    return (
      <div className="recent-prescriptions-container">
        <div className="loading-placeholder">Loading prescriptions...</div>
      </div>
    );
  }

  if (!prescriptions || prescriptions.length === 0) {
    return (
      <div className="recent-prescriptions-container">
        <div className="empty-placeholder">No recent prescriptions</div>
      </div>
    );
  }

  return (
    <div className="recent-prescriptions-container">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="prescription-card">
          <div className="prescription-header">
            <div className="prescription-title-row">
              <h4 className="prescription-number">
                #{prescription.prescriptionNumber}
              </h4>
              <div className="prescription-badges">
                <span className={getStatusBadgeClass(prescription.status)}>
                  {prescription.status || 'PENDING'}
                </span>
                <span className={getPriorityBadgeClass(prescription.priority)}>
                  {prescription.priority || 'MEDIUM'}
                </span>
              </div>
            </div>
            <div className="prescription-info-row">
              <div className="info-item">
                <span className="info-label">Patient:</span>
                <span className="info-value">{prescription.patientName || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Doctor:</span>
                <span className="info-value">{prescription.doctorName || 'N/A'}</span>
              </div>
              {prescription.prescriptionDate && (
                <div className="info-item">
                  <span className="info-label">Date:</span>
                  <span className="info-value">
                    {new Date(prescription.prescriptionDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {prescription.diagnosis && (
            <div className="prescription-section">
              <div className="section-label">Diagnosis</div>
              <div className="section-value">{prescription.diagnosis}</div>
            </div>
          )}

          {prescription.note && (
            <div className="prescription-section">
              <div className="section-label">Notes</div>
              <div className="section-value">{prescription.note}</div>
            </div>
          )}

          {prescription.mainAttributes && prescription.mainAttributes.length > 0 && (
            <div className="prescription-section medications-section">
              <div className="section-label">Medications</div>
              <div className="medications-list">
                {prescription.mainAttributes.map((mainAttr: PrescriptionMainAttribute, mainIndex: number) => (
                  <div key={mainIndex} className="medication-item">
                    <div className="medication-header">
                      <span className="medication-name">{mainAttr.name}</span>
                      {mainAttr.value && (
                        <span className="medication-value">{mainAttr.value}</span>
                      )}
                    </div>
                    {mainAttr.subAttributes && mainAttr.subAttributes.length > 0 && (
                      <div className="sub-attributes-list">
                        {mainAttr.subAttributes.map((subAttr, subIndex) => (
                          <div key={subIndex} className="sub-attribute-item">
                            <span className="sub-attribute-name">{subAttr.name}:</span>
                            <span className="sub-attribute-value">{subAttr.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentPrescriptions;

