// Centralized Error Handling and Loading States System
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Error types
export interface AppError {
  id: string;
  message: string;
  code?: string;
  status?: number;
  timestamp: Date;
  context?: string;
  details?: any;
}

// Loading state types
export interface LoadingState {
  [key: string]: boolean;
}

// Error context
interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  hasErrors: () => boolean;
}

// Loading context
interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearLoading: () => void;
}

// Create contexts
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Error Provider Component
export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    
    setErrors(prev => [...prev, newError]);
    
    // Auto-remove error after 10 seconds
    setTimeout(() => {
      removeError(newError.id);
    }, 10000);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const hasErrors = useCallback(() => {
    return errors.length > 0;
  }, [errors]);

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    hasErrors,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

// Loading Provider Component
export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }));
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  const clearLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  const value: LoadingContextType = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hooks
export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Error handling utilities
export const handleAPIError = (error: any, context?: string): AppError => {
  let message = 'An unexpected error occurred';
  let code: string | undefined;
  let status: number | undefined;
  let details: any = undefined;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error?.response) {
    // Axios error
    status = error.response.status;
    message = error.response.data?.message || error.message;
    code = error.response.data?.code;
    details = error.response.data;
  } else if (error?.status) {
    // Fetch error
    status = error.status;
    message = error.message || `HTTP ${status}`;
  }

  return {
    id: '',
    message,
    code,
    status,
    context,
    details,
    timestamp: new Date(),
  };
};

// Loading state utilities
export const createLoadingKey = (service: string, action: string): string => {
  return `${service}_${action}`;
};

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode; fallback?: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // You can add error reporting here
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    // You can add error reporting here
  });
};

export default {
  ErrorProvider,
  LoadingProvider,
  useError,
  useLoading,
  handleAPIError,
  createLoadingKey,
  ErrorBoundary,
  setupGlobalErrorHandler,
};
