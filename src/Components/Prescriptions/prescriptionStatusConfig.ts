/**
 * Prescription Status Configuration
 * Defines the complete prescription lifecycle and status rules
 */

export type PrescriptionStatus = 'pending' | 'approved' | 'paid' | 'verified' | 'dispatched';

export interface StatusConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon?: string;
  description: string;
  canEdit: boolean;
  canAddMedications: boolean;
  canAddAmount: boolean;
  canApprove: boolean;
  canVerifyPayment: boolean;
  canDispatch: boolean;
  nextStatus?: PrescriptionStatus;
}

export const PRESCRIPTION_STATUS_CONFIG: Record<PrescriptionStatus, StatusConfig> = {
  pending: {
    label: 'Pending',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
    icon: '⏳',
    description: 'Prescription received, awaiting admin review',
    canEdit: true,
    canAddMedications: true,
    canAddAmount: true,
    canApprove: true,
    canVerifyPayment: false,
    canDispatch: false,
    nextStatus: 'approved'
  },
  approved: {
    label: 'Approved',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
    icon: '✅',
    description: 'Prescription approved, waiting for customer payment',
    canEdit: false,
    canAddMedications: false,
    canAddAmount: false,
    canApprove: false,
    canVerifyPayment: false,
    canDispatch: false,
    nextStatus: 'paid'
  },
  paid: {
    label: 'Paid',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    icon: '💳',
    description: 'Payment received, awaiting admin verification',
    canEdit: false,
    canAddMedications: false,
    canAddAmount: false,
    canApprove: false,
    canVerifyPayment: true,
    canDispatch: false,
    nextStatus: 'verified'
  },
  verified: {
    label: 'Verified',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    icon: '✓',
    description: 'Payment verified, ready for dispatch',
    canEdit: false,
    canAddMedications: false,
    canAddAmount: false,
    canApprove: false,
    canVerifyPayment: false,
    canDispatch: true,
    nextStatus: 'dispatched'
  },
  dispatched: {
    label: 'Dispatched',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    borderColor: 'rgba(107, 114, 128, 0.2)',
    icon: '📦',
    description: 'Medicine dispatched to customer',
    canEdit: false,
    canAddMedications: false,
    canAddAmount: false,
    canApprove: false,
    canVerifyPayment: false,
    canDispatch: false
  }
};

/**
 * Get status configuration for a given status
 */
export const getStatusConfig = (status: PrescriptionStatus): StatusConfig => {
  return PRESCRIPTION_STATUS_CONFIG[status] || PRESCRIPTION_STATUS_CONFIG.pending;
};

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: PrescriptionStatus,
  targetStatus: PrescriptionStatus
): boolean => {
  const config = PRESCRIPTION_STATUS_CONFIG[currentStatus];
  return config.nextStatus === targetStatus;
};

/**
 * Get all available statuses
 */
export const getAllStatuses = (): PrescriptionStatus[] => {
  return Object.keys(PRESCRIPTION_STATUS_CONFIG) as PrescriptionStatus[];
};

/**
 * Get status label
 */
export const getStatusLabel = (status: PrescriptionStatus): string => {
  return PRESCRIPTION_STATUS_CONFIG[status]?.label || status;
};
