import { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLocale } from '../contexts/LocaleContext';

export const useGlobalTheme = () => {
  const { isDark } = useTheme();
  const { locale } = useLocale();

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme classes
    if (isDark) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }

    // Apply locale-specific styles
    root.style.setProperty('--current-theme', isDark ? 'dark' : 'light');
    root.style.setProperty('--current-locale', locale.language);
    root.style.setProperty('--current-currency', locale.currency);
    root.style.setProperty('--current-timezone', locale.timezone);
    
    // Update document language
    root.lang = locale.language;
    
    // Apply RTL support for Arabic/Hebrew
    if (['ar', 'he'].includes(locale.language)) {
      root.dir = 'rtl';
    } else {
      root.dir = 'ltr';
    }

    // Update page title with locale
    document.title = `CureBasket Admin - ${locale.country}`;

  }, [isDark, locale]);

  return {
    isDark,
    locale,
    themeClass: isDark ? 'dark-theme' : 'light-theme',
    localeClass: `locale-${locale.language}`,
    direction: ['ar', 'he'].includes(locale.language) ? 'rtl' : 'ltr'
  };
};
