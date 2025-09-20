import React from 'react';
import { useGlobalTheme } from '../hooks/useGlobalTheme';

interface GlobalThemeWrapperProps {
  children: React.ReactNode;
}

const GlobalThemeWrapper: React.FC<GlobalThemeWrapperProps> = ({ children }) => {
  useGlobalTheme(); // This applies the global theme and locale changes
  
  return <>{children}</>;
};

export default GlobalThemeWrapper;
