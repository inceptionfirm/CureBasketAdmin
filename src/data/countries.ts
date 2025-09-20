export interface CountryData {
  code: string;
  name: string;
  flag: string;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
}

export const countries: CountryData[] = [
  // North America
  { code: 'US', name: 'United States', flag: '🇺🇸', language: 'en', currency: 'USD', timezone: 'America/New_York', dateFormat: 'MM/DD/YYYY', numberFormat: 'en-US', currencySymbol: '$', currencyPosition: 'before' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', language: 'en', currency: 'CAD', timezone: 'America/Toronto', dateFormat: 'YYYY-MM-DD', numberFormat: 'en-CA', currencySymbol: 'C$', currencyPosition: 'before' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', language: 'es', currency: 'MXN', timezone: 'America/Mexico_City', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-MX', currencySymbol: '$', currencyPosition: 'before' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', language: 'en', currency: 'GBP', timezone: 'Europe/London', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-GB', currencySymbol: '£', currencyPosition: 'before' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', language: 'de', currency: 'EUR', timezone: 'Europe/Berlin', dateFormat: 'DD.MM.YYYY', numberFormat: 'de-DE', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'FR', name: 'France', flag: '🇫🇷', language: 'fr', currency: 'EUR', timezone: 'Europe/Paris', dateFormat: 'DD/MM/YYYY', numberFormat: 'fr-FR', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', language: 'es', currency: 'EUR', timezone: 'Europe/Madrid', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-ES', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', language: 'it', currency: 'EUR', timezone: 'Europe/Rome', dateFormat: 'DD/MM/YYYY', numberFormat: 'it-IT', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', language: 'nl', currency: 'EUR', timezone: 'Europe/Amsterdam', dateFormat: 'DD-MM-YYYY', numberFormat: 'nl-NL', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', language: 'sv', currency: 'SEK', timezone: 'Europe/Stockholm', dateFormat: 'YYYY-MM-DD', numberFormat: 'sv-SE', currencySymbol: 'kr', currencyPosition: 'after' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', language: 'no', currency: 'NOK', timezone: 'Europe/Oslo', dateFormat: 'DD.MM.YYYY', numberFormat: 'nb-NO', currencySymbol: 'kr', currencyPosition: 'after' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', language: 'da', currency: 'DKK', timezone: 'Europe/Copenhagen', dateFormat: 'DD.MM.YYYY', numberFormat: 'da-DK', currencySymbol: 'kr', currencyPosition: 'after' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', language: 'fi', currency: 'EUR', timezone: 'Europe/Helsinki', dateFormat: 'DD.MM.YYYY', numberFormat: 'fi-FI', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', language: 'pl', currency: 'PLN', timezone: 'Europe/Warsaw', dateFormat: 'DD.MM.YYYY', numberFormat: 'pl-PL', currencySymbol: 'zł', currencyPosition: 'after' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', language: 'ru', currency: 'RUB', timezone: 'Europe/Moscow', dateFormat: 'DD.MM.YYYY', numberFormat: 'ru-RU', currencySymbol: '₽', currencyPosition: 'after' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', language: 'de', currency: 'CHF', timezone: 'Europe/Zurich', dateFormat: 'DD.MM.YYYY', numberFormat: 'de-CH', currencySymbol: 'CHF', currencyPosition: 'after' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹', language: 'de', currency: 'EUR', timezone: 'Europe/Vienna', dateFormat: 'DD.MM.YYYY', numberFormat: 'de-AT', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', language: 'nl', currency: 'EUR', timezone: 'Europe/Brussels', dateFormat: 'DD/MM/YYYY', numberFormat: 'nl-BE', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', language: 'pt', currency: 'EUR', timezone: 'Europe/Lisbon', dateFormat: 'DD/MM/YYYY', numberFormat: 'pt-PT', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪', language: 'en', currency: 'EUR', timezone: 'Europe/Dublin', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-IE', currencySymbol: '€', currencyPosition: 'before' },
  
  // Asia Pacific
  { code: 'JP', name: 'Japan', flag: '🇯🇵', language: 'ja', currency: 'JPY', timezone: 'Asia/Tokyo', dateFormat: 'YYYY/MM/DD', numberFormat: 'ja-JP', currencySymbol: '¥', currencyPosition: 'before' },
  { code: 'CN', name: 'China', flag: '🇨🇳', language: 'zh', currency: 'CNY', timezone: 'Asia/Shanghai', dateFormat: 'YYYY-MM-DD', numberFormat: 'zh-CN', currencySymbol: '¥', currencyPosition: 'before' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', language: 'ko', currency: 'KRW', timezone: 'Asia/Seoul', dateFormat: 'YYYY.MM.DD', numberFormat: 'ko-KR', currencySymbol: '₩', currencyPosition: 'before' },
  { code: 'IN', name: 'India', flag: '🇮🇳', language: 'hi', currency: 'INR', timezone: 'Asia/Kolkata', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-IN', currencySymbol: '₹', currencyPosition: 'before' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', language: 'en', currency: 'AUD', timezone: 'Australia/Sydney', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-AU', currencySymbol: 'A$', currencyPosition: 'before' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', language: 'en', currency: 'NZD', timezone: 'Pacific/Auckland', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-NZ', currencySymbol: 'NZ$', currencyPosition: 'before' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', language: 'en', currency: 'SGD', timezone: 'Asia/Singapore', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-SG', currencySymbol: 'S$', currencyPosition: 'before' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', language: 'zh', currency: 'HKD', timezone: 'Asia/Hong_Kong', dateFormat: 'DD/MM/YYYY', numberFormat: 'zh-HK', currencySymbol: 'HK$', currencyPosition: 'before' },
  { code: 'TW', name: 'Taiwan', flag: '🇹🇼', language: 'zh', currency: 'TWD', timezone: 'Asia/Taipei', dateFormat: 'YYYY/MM/DD', numberFormat: 'zh-TW', currencySymbol: 'NT$', currencyPosition: 'before' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', language: 'th', currency: 'THB', timezone: 'Asia/Bangkok', dateFormat: 'DD/MM/YYYY', numberFormat: 'th-TH', currencySymbol: '฿', currencyPosition: 'before' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', language: 'ms', currency: 'MYR', timezone: 'Asia/Kuala_Lumpur', dateFormat: 'DD/MM/YYYY', numberFormat: 'ms-MY', currencySymbol: 'RM', currencyPosition: 'before' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', language: 'id', currency: 'IDR', timezone: 'Asia/Jakarta', dateFormat: 'DD/MM/YYYY', numberFormat: 'id-ID', currencySymbol: 'Rp', currencyPosition: 'before' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭', language: 'en', currency: 'PHP', timezone: 'Asia/Manila', dateFormat: 'MM/DD/YYYY', numberFormat: 'en-PH', currencySymbol: '₱', currencyPosition: 'before' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳', language: 'vi', currency: 'VND', timezone: 'Asia/Ho_Chi_Minh', dateFormat: 'DD/MM/YYYY', numberFormat: 'vi-VN', currencySymbol: '₫', currencyPosition: 'after' },
  
  // South America
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', language: 'pt', currency: 'BRL', timezone: 'America/Sao_Paulo', dateFormat: 'DD/MM/YYYY', numberFormat: 'pt-BR', currencySymbol: 'R$', currencyPosition: 'before' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', language: 'es', currency: 'ARS', timezone: 'America/Argentina/Buenos_Aires', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-AR', currencySymbol: '$', currencyPosition: 'before' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', language: 'es', currency: 'CLP', timezone: 'America/Santiago', dateFormat: 'DD-MM-YYYY', numberFormat: 'es-CL', currencySymbol: '$', currencyPosition: 'before' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', language: 'es', currency: 'COP', timezone: 'America/Bogota', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-CO', currencySymbol: '$', currencyPosition: 'before' },
  { code: 'PE', name: 'Peru', flag: '🇵🇪', language: 'es', currency: 'PEN', timezone: 'America/Lima', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-PE', currencySymbol: 'S/', currencyPosition: 'before' },
  { code: 'VE', name: 'Venezuela', flag: '🇻🇪', language: 'es', currency: 'VES', timezone: 'America/Caracas', dateFormat: 'DD/MM/YYYY', numberFormat: 'es-VE', currencySymbol: 'Bs', currencyPosition: 'before' },
  
  // Africa
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', language: 'en', currency: 'ZAR', timezone: 'Africa/Johannesburg', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-ZA', currencySymbol: 'R', currencyPosition: 'before' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', language: 'en', currency: 'NGN', timezone: 'Africa/Lagos', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-NG', currencySymbol: '₦', currencyPosition: 'before' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', language: 'ar', currency: 'EGP', timezone: 'Africa/Cairo', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-EG', currencySymbol: '£', currencyPosition: 'before' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', language: 'en', currency: 'KES', timezone: 'Africa/Nairobi', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-KE', currencySymbol: 'KSh', currencyPosition: 'before' },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', language: 'ar', currency: 'MAD', timezone: 'Africa/Casablanca', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-MA', currencySymbol: 'د.م.', currencyPosition: 'after' },
  
  // Middle East
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', language: 'ar', currency: 'AED', timezone: 'Asia/Dubai', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-AE', currencySymbol: 'د.إ', currencyPosition: 'after' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', language: 'ar', currency: 'SAR', timezone: 'Asia/Riyadh', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-SA', currencySymbol: 'ر.س', currencyPosition: 'after' },
  { code: 'IL', name: 'Israel', flag: '🇮🇱', language: 'he', currency: 'ILS', timezone: 'Asia/Jerusalem', dateFormat: 'DD/MM/YYYY', numberFormat: 'he-IL', currencySymbol: '₪', currencyPosition: 'before' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', language: 'tr', currency: 'TRY', timezone: 'Europe/Istanbul', dateFormat: 'DD.MM.YYYY', numberFormat: 'tr-TR', currencySymbol: '₺', currencyPosition: 'after' },
  
  // Additional Countries
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', language: 'is', currency: 'ISK', timezone: 'Atlantic/Reykjavik', dateFormat: 'DD.MM.YYYY', numberFormat: 'is-IS', currencySymbol: 'kr', currencyPosition: 'after' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', language: 'fr', currency: 'EUR', timezone: 'Europe/Luxembourg', dateFormat: 'DD/MM/YYYY', numberFormat: 'fr-LU', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', language: 'cs', currency: 'CZK', timezone: 'Europe/Prague', dateFormat: 'DD.MM.YYYY', numberFormat: 'cs-CZ', currencySymbol: 'Kč', currencyPosition: 'after' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', language: 'hu', currency: 'HUF', timezone: 'Europe/Budapest', dateFormat: 'YYYY.MM.DD', numberFormat: 'hu-HU', currencySymbol: 'Ft', currencyPosition: 'after' },
  { code: 'RO', name: 'Romania', flag: '🇷🇴', language: 'ro', currency: 'RON', timezone: 'Europe/Bucharest', dateFormat: 'DD.MM.YYYY', numberFormat: 'ro-RO', currencySymbol: 'lei', currencyPosition: 'after' },
  { code: 'BG', name: 'Bulgaria', flag: '🇧🇬', language: 'bg', currency: 'BGN', timezone: 'Europe/Sofia', dateFormat: 'DD.MM.YYYY', numberFormat: 'bg-BG', currencySymbol: 'лв', currencyPosition: 'after' },
  { code: 'HR', name: 'Croatia', flag: '🇭🇷', language: 'hr', currency: 'EUR', timezone: 'Europe/Zagreb', dateFormat: 'DD.MM.YYYY', numberFormat: 'hr-HR', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', language: 'sl', currency: 'EUR', timezone: 'Europe/Ljubljana', dateFormat: 'DD.MM.YYYY', numberFormat: 'sl-SI', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', language: 'sk', currency: 'EUR', timezone: 'Europe/Bratislava', dateFormat: 'DD.MM.YYYY', numberFormat: 'sk-SK', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', language: 'lt', currency: 'EUR', timezone: 'Europe/Vilnius', dateFormat: 'YYYY-MM-DD', numberFormat: 'lt-LT', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', language: 'lv', currency: 'EUR', timezone: 'Europe/Riga', dateFormat: 'DD.MM.YYYY', numberFormat: 'lv-LV', currencySymbol: '€', currencyPosition: 'after' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', language: 'et', currency: 'EUR', timezone: 'Europe/Tallinn', dateFormat: 'DD.MM.YYYY', numberFormat: 'et-EE', currencySymbol: '€', currencyPosition: 'after' },
];

// Helper function to get country by code
export const getCountryByCode = (code: string): CountryData | undefined => {
  return countries.find(country => country.code === code);
};

// Helper function to get all country codes
export const getAllCountryCodes = (): string[] => {
  return countries.map(country => country.code);
};

// Helper function to search countries
export const searchCountries = (query: string): CountryData[] => {
  const lowercaseQuery = query.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(lowercaseQuery) ||
    country.code.toLowerCase().includes(lowercaseQuery) ||
    country.language.toLowerCase().includes(lowercaseQuery)
  );
};
