import { useContext } from 'react';
import { ThemeModeContext } from '../context/ThemeContext';

const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error('useThemeMode must be used within AppThemeProvider');
  }
  return ctx;
};

export default useThemeMode;
