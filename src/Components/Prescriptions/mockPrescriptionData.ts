/**
 * Mock Prescription Data Generator
 * TODO: Replace with actual API calls when backend is ready
 */

import { AdminPrescription } from './AdminPrescriptionDetails';
import { PrescriptionStatus } from './prescriptionStatusConfig';
import { Medication } from './MedicationEditor';

// Generate mock prescriptions for testing
export const generateMockPrescriptions = (): AdminPrescription[] => {
  const mockPrescriptions: AdminPrescription[] = [
    {
      id: '1',
      prescriptionNumber: 'RX-2024-001',
      patient: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210'
      },
      doctorName: 'Dr. Sarah Smith',
      diagnosis: 'Fever and Cold',
      notes: 'Patient has mild fever. Prescribed antibiotics.',
      uploadedFiles: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/400x600?text=Prescription+1'
        }
      ],
      medications: [
        {
          id: 'med-1',
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '5 days'
        },
        {
          id: 'med-2',
          name: 'Azithromycin 250mg',
          dosage: '250mg',
          frequency: 'Once daily',
          duration: '3 days'
        }
      ],
      amount: 450,
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      prescriptionNumber: 'RX-2024-002',
      patient: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+91 98765 43211'
      },
      doctorName: 'Dr. Michael Johnson',
      diagnosis: 'Hypertension',
      notes: 'Regular checkup. Blood pressure under control.',
      uploadedFiles: [
        {
          type: 'pdf',
          url: 'https://via.placeholder.com/400x600?text=Prescription+2+PDF'
        }
      ],
      medications: [
        {
          id: 'med-3',
          name: 'Amlodipine 5mg',
          dosage: '5mg',
          frequency: 'Once daily',
          duration: '30 days'
        }
      ],
      amount: 320,
      status: 'approved',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      prescriptionNumber: 'RX-2024-003',
      patient: {
        name: 'Robert Williams',
        email: 'robert.w@example.com',
        phone: '+91 98765 43212'
      },
      doctorName: 'Dr. Emily Davis',
      diagnosis: 'Diabetes Type 2',
      notes: 'Blood sugar levels need monitoring.',
      uploadedFiles: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/400x600?text=Prescription+3'
        },
        {
          type: 'image',
          url: 'https://via.placeholder.com/400x600?text=Prescription+3+Page+2'
        }
      ],
      medications: [
        {
          id: 'med-4',
          name: 'Metformin 500mg',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '30 days'
        },
        {
          id: 'med-5',
          name: 'Gliclazide 80mg',
          dosage: '80mg',
          frequency: 'Once daily',
          duration: '30 days'
        }
      ],
      amount: 680,
      status: 'paid',
      transactionId: 'TXN-2024-001234',
      paymentScreenshot: 'https://via.placeholder.com/600x400?text=Payment+Screenshot',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      prescriptionNumber: 'RX-2024-004',
      patient: {
        name: 'Maria Garcia',
        email: 'maria.g@example.com',
        phone: '+91 98765 43213'
      },
      doctorName: 'Dr. James Wilson',
      diagnosis: 'Migraine',
      notes: 'Severe headaches. Prescribed pain relief medication.',
      uploadedFiles: [
        {
          type: 'pdf',
          url: 'https://via.placeholder.com/400x600?text=Prescription+4+PDF'
        }
      ],
      medications: [
        {
          id: 'med-6',
          name: 'Sumatriptan 50mg',
          dosage: '50mg',
          frequency: 'As needed',
          duration: '10 days'
        }
      ],
      amount: 550,
      status: 'verified',
      transactionId: 'TXN-2024-001235',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      prescriptionNumber: 'RX-2024-005',
      patient: {
        name: 'David Brown',
        email: 'david.b@example.com',
        phone: '+91 98765 43214'
      },
      doctorName: 'Dr. Lisa Anderson',
      diagnosis: 'Asthma',
      notes: 'Regular inhaler usage. Patient doing well.',
      uploadedFiles: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/400x600?text=Prescription+5'
        }
      ],
      medications: [
        {
          id: 'med-7',
          name: 'Salbutamol Inhaler',
          dosage: '100mcg',
          frequency: 'As needed',
          duration: '30 days'
        }
      ],
      amount: 420,
      status: 'dispatched',
      transactionId: 'TXN-2024-001236',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '6',
      prescriptionNumber: 'RX-2024-006',
      patient: {
        name: 'Emma Taylor',
        email: 'emma.t@example.com',
        phone: '+91 98765 43215'
      },
      doctorName: 'Dr. William Martinez',
      diagnosis: 'Acne',
      notes: 'Topical treatment for mild acne.',
      uploadedFiles: [
        {
          type: 'image',
          url: 'https://via.placeholder.com/400x600?text=Prescription+6'
        }
      ],
      medications: [
        {
          id: 'med-8',
          name: 'Benzoyl Peroxide 2.5%',
          dosage: '2.5%',
          frequency: 'Once daily',
          duration: '14 days'
        }
      ],
      amount: 280,
      status: 'pending',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return mockPrescriptions;
};

/**
 * Calculate prescription statistics from mock data
 */
export const calculateMockStats = (prescriptions: AdminPrescription[]) => {
  const stats = {
    total: prescriptions.length,
    pending: prescriptions.filter(p => p.status === 'pending').length,
    approved: prescriptions.filter(p => p.status === 'approved').length,
    paid: prescriptions.filter(p => p.status === 'paid').length,
    verified: prescriptions.filter(p => p.status === 'verified').length,
    dispatched: prescriptions.filter(p => p.status === 'dispatched').length
  };

  return stats;
};
