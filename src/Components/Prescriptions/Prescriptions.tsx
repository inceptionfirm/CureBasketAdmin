import React, { useState, useEffect } from 'react';
import { useLocale } from '../../contexts/LocaleContext';
import './Prescriptions.css';

// TypeScript interfaces for Prescriptions
interface PrescriptionStats {
  totalPrescriptions: number;
  pending: number;
  completed: number;
  cancelled: number;
}

interface Prescription {
  id: string;
  patientName: string;
  doctorName: string;
  medication: string;
  status: 'pending' | 'completed' | 'cancelled' | 'processing';
  dateCreated: string;
  dateUpdated: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface PrescriptionsProps {
  // Add any props if needed in the future
}

const Prescriptions: React.FC<PrescriptionsProps> = () => {
  const { t, formatNumber, formatDate } = useLocale();
  
  // State management
  const [stats, setStats] = useState<PrescriptionStats>({
    totalPrescriptions: 1250,
    pending: 45,
    completed: 1180,
    cancelled: 25
  });
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load prescriptions data
  useEffect(() => {
    const loadPrescriptions = async (): Promise<void> => {
      setLoading(true);
      try {
        // Mock data for now - replace with actual API call
        const mockPrescriptions: Prescription[] = [
          {
            id: 'RX-001',
            patientName: 'John Doe',
            doctorName: 'Dr. Smith',
            medication: 'Amoxicillin 500mg',
            status: 'pending',
            dateCreated: '2024-01-26',
            dateUpdated: '2024-01-26',
            priority: 'medium'
          },
          {
            id: 'RX-002',
            patientName: 'Jane Smith',
            doctorName: 'Dr. Johnson',
            medication: 'Ibuprofen 200mg',
            status: 'completed',
            dateCreated: '2024-01-25',
            dateUpdated: '2024-01-25',
            priority: 'low'
          }
        ];
        setPrescriptions(mockPrescriptions);
      } catch (err) {
        setError('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };

    loadPrescriptions();
  }, []);

  // Event handlers
  const handleAddPrescription = (): void => {
    console.log('Add prescription clicked');
  };

  const handlePrescriptionClick = (prescription: Prescription): void => {
    console.log('Prescription clicked:', prescription.id);
  };

  return (
    <div className="admin-main">
      <div className="page-header">
        <h1>{t('prescriptions.title')}</h1>
        <p>{t('prescriptions.subtitle')}</p>
      </div>
      
      <div className="prescriptions-content">
        <div className="prescriptions-stats">
          <div className="stat-card">
            <div className="stat-icon">💊</div>
            <div className="stat-content">
              <h3>{t('prescriptions.totalPrescriptions')}</h3>
              <p className="stat-number">{formatNumber(stats.totalPrescriptions)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>{t('prescriptions.pending')}</h3>
              <p className="stat-number">{formatNumber(stats.pending)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{t('prescriptions.completed')}</h3>
              <p className="stat-number">{formatNumber(stats.completed)}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>{t('prescriptions.cancelled')}</h3>
              <p className="stat-number">{formatNumber(stats.cancelled)}</p>
            </div>
          </div>
        </div>
        
        <div className="prescriptions-table-container">
          <div className="table-header">
            <h2>{t('prescriptions.prescriptionList')}</h2>
            <button 
              className="btn-primary"
              onClick={handleAddPrescription}
            >
              {t('prescriptions.addPrescription')}
            </button>
          </div>
          
          {loading ? (
            <div className="table-loading">
              <div className="loading-spinner"></div>
              <p>{t('prescriptions.loading')}</p>
            </div>
          ) : error ? (
            <div className="table-error">
              <p>⚠️ {error}</p>
              <button 
                className="btn-secondary"
                onClick={() => window.location.reload()}
              >
                {t('prescriptions.retry')}
              </button>
            </div>
          ) : prescriptions.length > 0 ? (
            <div className="prescriptions-table">
              <div className="table-row table-header-row">
                <div className="table-cell">{t('prescriptions.id')}</div>
                <div className="table-cell">{t('prescriptions.patient')}</div>
                <div className="table-cell">{t('prescriptions.doctor')}</div>
                <div className="table-cell">{t('prescriptions.medication')}</div>
                <div className="table-cell">{t('prescriptions.status')}</div>
                <div className="table-cell">{t('prescriptions.priority')}</div>
                <div className="table-cell">{t('prescriptions.dateCreated')}</div>
              </div>
              {prescriptions.map((prescription) => (
                <div 
                  key={prescription.id}
                  className="table-row table-data-row"
                  onClick={() => handlePrescriptionClick(prescription)}
                >
                  <div className="table-cell">{prescription.id}</div>
                  <div className="table-cell">{prescription.patientName}</div>
                  <div className="table-cell">{prescription.doctorName}</div>
                  <div className="table-cell">{prescription.medication}</div>
                  <div className="table-cell">
                    <span className={`status-badge status-${prescription.status}`}>
                      {t(`prescriptions.status.${prescription.status}`)}
                    </span>
                  </div>
                  <div className="table-cell">
                    <span className={`priority-badge priority-${prescription.priority}`}>
                      {t(`prescriptions.priority.${prescription.priority}`)}
                    </span>
                  </div>
                  <div className="table-cell">{formatDate(new Date(prescription.dateCreated))}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-empty">
              <p>{t('prescriptions.noPrescriptions')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
