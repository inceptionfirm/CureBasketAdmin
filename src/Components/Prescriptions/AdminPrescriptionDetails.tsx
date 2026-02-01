import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import MedicationEditor, { Medication } from './MedicationEditor';
import PaymentVerification from './PaymentVerification';
import { PrescriptionStatus, getStatusConfig } from './prescriptionStatusConfig';
import './AdminPrescriptionDetails.css';

export interface AdminPrescription {
  id: string;
  prescriptionNumber: string;
  patient: {
    name: string;
    email?: string;
    phone?: string;
  };
  doctorName: string;
  diagnosis?: string;
  notes?: string;
  uploadedFiles: {
    type: 'pdf' | 'image';
    url: string;
  }[];
  medications: Medication[];
  amount?: number;
  status: PrescriptionStatus;
  transactionId?: string;
  paymentScreenshot?: string;
  createdAt: string;
}

interface AdminPrescriptionDetailsProps {
  prescription: AdminPrescription;
  onStatusChange: (prescriptionId: string, newStatus: PrescriptionStatus) => void;
  onMedicationsChange: (prescriptionId: string, medications: Medication[]) => void;
  onAmountChange: (prescriptionId: string, amount: number) => void;
  onClose: () => void;
}

const AdminPrescriptionDetails: React.FC<AdminPrescriptionDetailsProps> = ({
  prescription,
  onStatusChange,
  onMedicationsChange,
  onAmountChange,
  onClose
}) => {
  const [localAmount, setLocalAmount] = useState<number | undefined>(prescription.amount);
  const [viewingFile, setViewingFile] = useState<{ type: 'pdf' | 'image'; url: string } | null>(null);
  const statusConfig = getStatusConfig(prescription.status);

  const handleApprove = () => {
    if (prescription.medications.length === 0) {
      alert('Please add at least one medication before approving');
      return;
    }
    if (!localAmount || localAmount <= 0) {
      alert('Please add a valid amount before approving');
      return;
    }
    // TODO: API call to approve prescription
    // await prescriptionService.updatePrescription(prescription.id, { status: 'approved' });
    onStatusChange(prescription.id, 'approved');
    alert('✅ Prescription approved! Email sent to customer (placeholder).');
  };

  const handleVerifyPayment = () => {
    // TODO: API call to verify payment
    // await prescriptionService.updatePrescription(prescription.id, { status: 'verified' });
    onStatusChange(prescription.id, 'verified');
    alert('✅ Payment verified! Prescription ready for dispatch.');
  };

  const handleDispatch = () => {
    // TODO: API call to dispatch
    // await prescriptionService.updatePrescription(prescription.id, { status: 'dispatched' });
    onStatusChange(prescription.id, 'dispatched');
    alert('✅ Medicine dispatched! Dispatch email sent to customer (placeholder).');
  };

  const handleAmountSave = () => {
    if (!localAmount || localAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    // TODO: API call to update amount
    // await prescriptionService.updatePrescription(prescription.id, { amount: localAmount });
    onAmountChange(prescription.id, localAmount);
    alert('Amount updated successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-prescription-details-overlay" onClick={onClose}>
      <div className="admin-prescription-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="prescription-details-header">
          <div className="prescription-details-title-section">
            <h2 className="prescription-details-title">Prescription Details</h2>
            <p className="prescription-details-number">{prescription.prescriptionNumber}</p>
          </div>
          <button onClick={onClose} className="btn-close-modal" title="Close">
            ×
          </button>
        </div>

        <div className="prescription-details-content">
          {/* Prescription Information Section */}
          <section className="prescription-section">
            <h3 className="section-title">Prescription Information</h3>
            <div className="section-content">
              <div className="info-row">
                <span className="info-label">Prescription Number:</span>
                <span className="info-value">{prescription.prescriptionNumber}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Upload Date:</span>
                <span className="info-value">{formatDate(prescription.createdAt)}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Status:</span>
                <StatusBadge status={prescription.status} showIcon size="medium" />
              </div>
            </div>
          </section>

          {/* Patient Details Section */}
          <section className="prescription-section">
            <h3 className="section-title">Patient Details</h3>
            <div className="section-content">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{prescription.patient.name}</span>
              </div>
              {prescription.patient.email && (
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">
                    <a href={`mailto:${prescription.patient.email}`}>{prescription.patient.email}</a>
                  </span>
                </div>
              )}
              {prescription.patient.phone && (
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">
                    <a href={`tel:${prescription.patient.phone}`}>{prescription.patient.phone}</a>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Doctor & Medical Info Section */}
          <section className="prescription-section">
            <h3 className="section-title">Doctor & Medical Info</h3>
            <div className="section-content">
              <div className="info-row">
                <span className="info-label">Doctor Name:</span>
                <span className="info-value">{prescription.doctorName}</span>
              </div>
              {prescription.diagnosis && (
                <div className="info-row">
                  <span className="info-label">Diagnosis:</span>
                  <span className="info-value">{prescription.diagnosis}</span>
                </div>
              )}
              {prescription.notes && (
                <div className="info-row">
                  <span className="info-label">Notes:</span>
                  <span className="info-value">{prescription.notes}</span>
                </div>
              )}
            </div>
          </section>

          {/* Uploaded Documents Section */}
          {prescription.uploadedFiles.length > 0 && (
            <section className="prescription-section">
              <h3 className="section-title">Uploaded Documents</h3>
              <div className="section-content">
                <div className="uploaded-files-grid">
                  {prescription.uploadedFiles.map((file, index) => (
                    <div key={index} className="uploaded-file-item">
                      {file.type === 'image' ? (
                        <img
                          src={file.url}
                          alt={`Prescription ${index + 1}`}
                          className="uploaded-file-preview"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="uploaded-file-preview pdf-preview">
                          <span className="pdf-icon">📄</span>
                          <span className="pdf-label">PDF Document</span>
                        </div>
                      )}
                      <div className="file-actions">
                        <button
                          type="button"
                          onClick={() => setViewingFile(file)}
                          className="btn-view-file"
                          title="Preview on this page"
                        >
                          <span className="btn-icon">👁️</span>
                          <span className="btn-text">View</span>
                        </button>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-open-new-tab"
                          title="Open in new tab"
                        >
                          <span className="btn-icon">🔗</span>
                          <span className="btn-text">New Tab</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Medications Section */}
          <section className="prescription-section">
            <MedicationEditor
              medications={prescription.medications}
              onMedicationsChange={(meds) => onMedicationsChange(prescription.id, meds)}
              editable={statusConfig.canAddMedications}
            />
          </section>

          {/* Amount Section */}
          <section className="prescription-section">
            <h3 className="section-title">Amount</h3>
            <div className="section-content">
              {statusConfig.canAddAmount ? (
                <div className="amount-editor">
                  <div className="amount-input-group">
                    <label className="amount-label">Amount (₹):</label>
                    <input
                      type="number"
                      value={localAmount || ''}
                      onChange={(e) => setLocalAmount(Number(e.target.value))}
                      placeholder="Enter amount"
                      min="0"
                      step="0.01"
                      className="amount-input"
                    />
                    <button
                      type="button"
                      onClick={handleAmountSave}
                      className="btn-save-amount"
                      disabled={!localAmount || localAmount <= 0}
                    >
                      Save Amount
                    </button>
                  </div>
                  {localAmount && localAmount > 0 && (
                    <p className="amount-display">Current Amount: ₹{localAmount.toLocaleString('en-IN')}</p>
                  )}
                </div>
              ) : (
                <div className="amount-display">
                  {prescription.amount ? (
                    <span className="amount-value">₹{prescription.amount.toLocaleString('en-IN')}</span>
                  ) : (
                    <span className="amount-missing">No amount set</span>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Payment Verification Section */}
          {prescription.status === 'paid' && (
            <section className="prescription-section">
              <PaymentVerification
                transactionId={prescription.transactionId}
                amount={prescription.amount}
                paymentScreenshot={prescription.paymentScreenshot}
                onVerify={handleVerifyPayment}
              />
            </section>
          )}

          {/* Admin Actions Section */}
          <section className="prescription-section prescription-actions-section">
            <h3 className="section-title">Admin Actions</h3>
            <div className="section-content">
              <div className="admin-actions">
                {statusConfig.canApprove && (
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="btn-approve"
                    disabled={prescription.medications.length === 0 || !prescription.amount || prescription.amount <= 0}
                    title={
                      prescription.medications.length === 0
                        ? 'Add medications first'
                        : !prescription.amount || prescription.amount <= 0
                          ? 'Add amount first'
                          : 'Approve prescription'
                    }
                  >
                    <span className="button-icon">✓</span>
                    Approve Prescription
                  </button>
                )}

                {statusConfig.canVerifyPayment && (
                  <button
                    type="button"
                    onClick={handleVerifyPayment}
                    className="btn-verify"
                    disabled={!prescription.transactionId || !prescription.amount}
                  >
                    <span className="button-icon">✓</span>
                    Verify Payment
                  </button>
                )}

                {statusConfig.canDispatch && (
                  <button
                    type="button"
                    onClick={handleDispatch}
                    className="btn-dispatch"
                  >
                    <span className="button-icon">📦</span>
                    Dispatch Medicine
                  </button>
                )}

                {prescription.status === 'dispatched' && (
                  <div className="status-locked-message">
                    <p>🔒 This prescription is fully processed and locked.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="file-viewer-overlay" onClick={() => setViewingFile(null)}>
          <div className="file-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="file-viewer-header">
              <h3>View Document</h3>
              <button
                type="button"
                onClick={() => setViewingFile(null)}
                className="file-viewer-close"
              >
                ×
              </button>
            </div>
            <div className="file-viewer-content">
              {viewingFile.type === 'image' ? (
                <img
                  src={viewingFile.url}
                  alt="Prescription Document"
                  className="file-viewer-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-image.png';
                  }}
                />
              ) : (
                <iframe
                  src={viewingFile.url}
                  className="file-viewer-pdf"
                  title="Prescription PDF"
                />
              )}
            </div>
            <div className="file-viewer-footer">
              <a
                href={viewingFile.url}
                target="_blank"
                rel="noopener noreferrer"
                className="file-viewer-link"
              >
                🔗 Open in New Tab
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPrescriptionDetails;
