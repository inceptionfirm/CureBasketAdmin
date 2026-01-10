import { createContext, useContext, useState, ReactNode } from 'react';
import { countries, getCountryByCode, CountryData } from '../data/countries';

export type Country = string;

export interface LocaleConfig {
  country: Country;
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
}

interface LocaleContextType {
  locale: LocaleConfig;
  setLocale: (country: Country) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: Date) => string;
  formatNumber: (number: number) => string;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

// Helper function to convert CountryData to LocaleConfig
const countryDataToLocaleConfig = (countryData: CountryData): LocaleConfig => ({
  country: countryData.code,
  language: countryData.language,
  currency: countryData.currency,
  timezone: countryData.timezone,
  dateFormat: countryData.dateFormat,
  numberFormat: countryData.numberFormat,
  currencySymbol: countryData.currencySymbol,
  currencyPosition: countryData.currencyPosition
});

// Translations
const translations: Record<string, Record<string, string>> = {
  en: {
    'settings.title': 'Settings',
    'settings.subtitle': 'Customize your application preferences',
    'settings.appearance': 'Appearance',
    'settings.notifications': 'Notifications',
    'settings.general': 'General',
    'settings.language': 'Language',
    'settings.country': 'Country',
    'settings.currency': 'Currency',
    'settings.timezone': 'Timezone',
    'settings.save': 'Save Settings',
    'settings.reset': 'Reset to Default',
    'settings.theme': 'Theme',
    'settings.quickToggle': 'Quick Toggle',
    'settings.currentTheme': 'Current Theme',
    'settings.enableNotifications': 'Enable Notifications',
    'settings.emailNotifications': 'Email Notifications',
    'settings.pushNotifications': 'Push Notifications',
    'settings.autoSave': 'Auto Save',
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back! Here\'s your business overview.',
    'dashboard.overview': 'Overview',
    'dashboard.searchFilters': 'Search & Filters',
    'dashboard.ordersCompleted': 'Orders Completed',
    'dashboard.activeBuyers': 'Active Buyers',
    'dashboard.totalRevenue': 'Total Revenue',
    'dashboard.conversionRate': 'Conversion Rate',
    'dashboard.analyticsReports': 'Analytics & Reports',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.users': 'Users',
    'sidebar.categories': 'Categories',
    'sidebar.blogs': 'Blogs',
    'sidebar.bannerManagement': 'Banner Management',
    'sidebar.prescriptions': 'Prescriptions',
    'sidebar.medicine': 'Medicine',
    'sidebar.profile': 'Profile',
    'sidebar.settings': 'Settings',
    'header.profile': 'Profile',
    'header.settings': 'Settings',
    'header.contact': 'Contact',
    'header.help': 'Help',
    'header.signOut': 'Sign Out',
    'login.emailRequired': 'Email is required',
    'login.emailInvalid': 'Email is invalid',
    'login.passwordRequired': 'Password is required',
    'login.passwordMinLength': 'Password must be at least 6 characters',
    'login.loginFailed': 'Login failed',
    'login.unexpectedError': 'An unexpected error occurred',
    'login.emailPlaceholder': 'Enter your email',
    'login.passwordPlaceholder': 'Enter your password',
    'login.signIn': 'Sign In',
    'profile.title': 'Profile Settings',
    'profile.subtitle': 'Manage your CureBasket account information and healthcare preferences',
    'profile.chooseAvatar': 'Choose Avatar:',
    'profile.fullName': 'Full Name',
    'profile.emailAddress': 'Email Address',
    'profile.role': 'Role',
    'profile.editProfile': 'Edit Profile',
    'profile.saveChanges': 'Save Changes',
    'profile.cancel': 'Cancel',
    'profile.updateSuccess': 'Profile updated successfully!',
    'users.title': 'Users Management',
    'users.subtitle': 'Manage user accounts and permissions',
    'users.totalUsers': 'Total Users',
    'users.activeUsers': 'Active Users',
    'users.newThisMonth': 'New This Month',
    'users.userList': 'User List',
    'users.addUser': 'Add User',
    'users.tableComingSoon': 'User management table coming soon...',
    'categories.title': 'Categories Management',
    'categories.subtitle': 'Organize products into categories',
    'categories.totalCategories': 'Total Categories',
    'categories.activeCategories': 'Active Categories',
    'categories.totalProducts': 'Total Products',
    'categories.categoryList': 'Category List',
    'categories.addCategory': 'Add Category',
    'categories.tableComingSoon': 'Category management table coming soon...',
    'blogs.title': 'Blog Management',
    'blogs.subtitle': 'Create and manage blog posts',
    'blogs.totalPosts': 'Total Posts',
    'blogs.totalViews': 'Total Views',
    'blogs.thisMonth': 'This Month',
    'blogs.postList': 'Post List',
    'blogs.createPost': 'Create Post',
    'blogs.tableComingSoon': 'Blog management table coming soon...',
    'banner.title': 'Banner Management',
    'banner.subtitle': 'Manage promotional banners and ads',
    'banner.totalBanners': 'Total Banners',
    'banner.totalImpressions': 'Total Impressions',
    'banner.activeBanners': 'Active Banners',
    'banner.bannerList': 'Banner List',
    'banner.createBanner': 'Create Banner',
    'banner.tableComingSoon': 'Banner management table coming soon...',
    'prescriptions.title': 'Prescriptions Management',
    'prescriptions.subtitle': 'Manage prescription orders and tracking',
    'prescriptions.totalPrescriptions': 'Total Prescriptions',
    'prescriptions.pending': 'Pending',
    'prescriptions.completed': 'Completed',
    'prescriptions.prescriptionList': 'Prescription List',
    'prescriptions.addPrescription': 'Add Prescription',
    'prescriptions.tableComingSoon': 'Prescription management table coming soon...',
    'prescriptions.cancelled': 'Cancelled',
    'prescriptions.loading': 'Loading prescriptions...',
    'prescriptions.retry': 'Retry',
    'prescriptions.id': 'ID',
    'prescriptions.patient': 'Patient',
    'prescriptions.doctor': 'Doctor',
    'prescriptions.medication': 'Medication',
    'prescriptions.status': 'Status',
    'prescriptions.priority': 'Priority',
    'prescriptions.dateCreated': 'Date Created',
    'prescriptions.noPrescriptions': 'No prescriptions found',
    'prescriptions.status.pending': 'Pending',
    'prescriptions.status.completed': 'Completed',
    'prescriptions.status.cancelled': 'Cancelled',
    'prescriptions.status.processing': 'Processing',
    'prescriptions.priority.low': 'Low',
    'prescriptions.priority.medium': 'Medium',
    'prescriptions.priority.high': 'High',
    'prescriptions.priority.urgent': 'Urgent'
  },
  de: {
    'settings.title': 'Einstellungen',
    'settings.subtitle': 'Passen Sie Ihre Anwendungseinstellungen an',
    'settings.appearance': 'Erscheinungsbild',
    'settings.notifications': 'Benachrichtigungen',
    'settings.general': 'Allgemein',
    'settings.language': 'Sprache',
    'settings.country': 'Land',
    'settings.currency': 'Währung',
    'settings.timezone': 'Zeitzone',
    'settings.save': 'Einstellungen speichern',
    'settings.reset': 'Auf Standard zurücksetzen',
    'settings.theme': 'Design',
    'settings.quickToggle': 'Schnellumschaltung',
    'settings.currentTheme': 'Aktuelles Design',
    'settings.enableNotifications': 'Benachrichtigungen aktivieren',
    'settings.emailNotifications': 'E-Mail-Benachrichtigungen',
    'settings.pushNotifications': 'Push-Benachrichtigungen',
    'settings.autoSave': 'Automatisches Speichern',
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Willkommen zurück! Hier ist Ihre Geschäftsübersicht.',
    'dashboard.overview': 'Übersicht',
    'dashboard.searchFilters': 'Suche & Filter',
    'dashboard.ordersCompleted': 'Abgeschlossene Bestellungen',
    'dashboard.activeBuyers': 'Aktive Käufer',
    'dashboard.totalRevenue': 'Gesamtumsatz',
    'dashboard.conversionRate': 'Konversionsrate',
    'dashboard.analyticsReports': 'Analysen & Berichte',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.users': 'Benutzer',
    'sidebar.categories': 'Kategorien',
    'sidebar.blogs': 'Blogs',
    'sidebar.bannerManagement': 'Banner-Verwaltung',
    'sidebar.prescriptions': 'Rezepte',
    'sidebar.medicine': 'Medizin',
    'sidebar.profile': 'Profil',
    'sidebar.settings': 'Einstellungen',
    'header.profile': 'Profil',
    'header.settings': 'Einstellungen',
    'header.contact': 'Kontakt',
    'header.help': 'Hilfe',
    'header.signOut': 'Abmelden',
    'login.emailRequired': 'E-Mail ist erforderlich',
    'login.emailInvalid': 'E-Mail ist ungültig',
    'login.passwordRequired': 'Passwort ist erforderlich',
    'login.passwordMinLength': 'Passwort muss mindestens 6 Zeichen haben',
    'login.loginFailed': 'Anmeldung fehlgeschlagen',
    'login.unexpectedError': 'Ein unerwarteter Fehler ist aufgetreten',
    'login.emailPlaceholder': 'Geben Sie Ihre E-Mail ein',
    'login.passwordPlaceholder': 'Geben Sie Ihr Passwort ein',
    'login.signIn': 'Anmelden',
    'profile.title': 'Profil-Einstellungen',
    'profile.subtitle': 'Verwalten Sie Ihre CureBasket-Kontoinformationen und Gesundheitspräferenzen',
    'profile.chooseAvatar': 'Avatar wählen:',
    'profile.fullName': 'Vollständiger Name',
    'profile.emailAddress': 'E-Mail-Adresse',
    'profile.role': 'Rolle',
    'profile.editProfile': 'Profil bearbeiten',
    'profile.saveChanges': 'Änderungen speichern',
    'profile.cancel': 'Abbrechen',
    'profile.updateSuccess': 'Profil erfolgreich aktualisiert!'
  },
  fr: {
    'settings.title': 'Paramètres',
    'settings.subtitle': 'Personnalisez vos préférences d\'application',
    'settings.appearance': 'Apparence',
    'settings.notifications': 'Notifications',
    'settings.general': 'Général',
    'settings.language': 'Langue',
    'settings.country': 'Pays',
    'settings.currency': 'Devise',
    'settings.timezone': 'Fuseau horaire',
    'settings.save': 'Enregistrer les paramètres',
    'settings.reset': 'Réinitialiser par défaut',
    'settings.theme': 'Thème',
    'settings.quickToggle': 'Basculement rapide',
    'settings.currentTheme': 'Thème actuel',
    'settings.enableNotifications': 'Activer les notifications',
    'settings.emailNotifications': 'Notifications par e-mail',
    'settings.pushNotifications': 'Notifications push',
    'settings.autoSave': 'Sauvegarde automatique',
    'dashboard.title': 'Tableau de bord',
    'dashboard.welcome': 'Bon retour ! Voici un aperçu de votre entreprise.',
    'dashboard.overview': 'Aperçu',
    'dashboard.searchFilters': 'Recherche et filtres',
    'dashboard.ordersCompleted': 'Commandes terminées',
    'dashboard.activeBuyers': 'Acheteurs actifs',
    'dashboard.totalRevenue': 'Revenus totaux',
    'dashboard.conversionRate': 'Taux de conversion',
    'dashboard.analyticsReports': 'Analyses et rapports',
    'sidebar.dashboard': 'Tableau de bord',
    'sidebar.users': 'Utilisateurs',
    'sidebar.categories': 'Catégories',
    'sidebar.blogs': 'Blogs',
    'sidebar.bannerManagement': 'Gestion des bannières',
    'sidebar.prescriptions': 'Ordonnances',
    'sidebar.medicine': 'Médecine',
    'sidebar.profile': 'Profil',
    'sidebar.settings': 'Paramètres',
    'header.profile': 'Profil',
    'header.settings': 'Paramètres',
    'header.contact': 'Contact',
    'header.help': 'Aide',
    'header.signOut': 'Se déconnecter',
    'login.emailRequired': 'L\'e-mail est requis',
    'login.emailInvalid': 'L\'e-mail est invalide',
    'login.passwordRequired': 'Le mot de passe est requis',
    'login.passwordMinLength': 'Le mot de passe doit contenir au moins 6 caractères',
    'login.loginFailed': 'Échec de la connexion',
    'login.unexpectedError': 'Une erreur inattendue s\'est produite',
    'login.emailPlaceholder': 'Entrez votre e-mail',
    'login.passwordPlaceholder': 'Entrez votre mot de passe',
    'login.signIn': 'Se connecter'
  },
  es: {
    'settings.title': 'Configuración',
    'settings.subtitle': 'Personaliza las preferencias de tu aplicación',
    'settings.appearance': 'Apariencia',
    'settings.notifications': 'Notificaciones',
    'settings.general': 'General',
    'settings.language': 'Idioma',
    'settings.country': 'País',
    'settings.currency': 'Moneda',
    'settings.timezone': 'Zona horaria',
    'settings.save': 'Guardar configuración',
    'settings.reset': 'Restablecer por defecto',
    'settings.theme': 'Tema',
    'settings.quickToggle': 'Cambio rápido',
    'settings.currentTheme': 'Tema actual',
    'settings.enableNotifications': 'Habilitar notificaciones',
    'settings.emailNotifications': 'Notificaciones por correo',
    'settings.pushNotifications': 'Notificaciones push',
    'settings.autoSave': 'Guardado automático',
    'dashboard.title': 'Panel de control',
    'dashboard.welcome': '¡Bienvenido de nuevo! Aquí está el resumen de su negocio.',
    'dashboard.overview': 'Resumen',
    'dashboard.searchFilters': 'Búsqueda y filtros',
    'dashboard.ordersCompleted': 'Pedidos completados',
    'dashboard.activeBuyers': 'Compradores activos',
    'dashboard.totalRevenue': 'Ingresos totales',
    'dashboard.conversionRate': 'Tasa de conversión',
    'dashboard.analyticsReports': 'Análisis e informes',
    'sidebar.dashboard': 'Panel de control',
    'sidebar.users': 'Usuarios',
    'sidebar.categories': 'Categorías',
    'sidebar.blogs': 'Blogs',
    'sidebar.bannerManagement': 'Gestión de banners',
    'sidebar.prescriptions': 'Recetas',
    'sidebar.medicine': 'Medicina',
    'sidebar.profile': 'Perfil',
    'sidebar.settings': 'Configuración',
    'header.profile': 'Perfil',
    'header.settings': 'Configuración',
    'header.contact': 'Contacto',
    'header.help': 'Ayuda',
    'header.signOut': 'Cerrar sesión',
    'login.emailRequired': 'El correo electrónico es requerido',
    'login.emailInvalid': 'El correo electrónico es inválido',
    'login.passwordRequired': 'La contraseña es requerida',
    'login.passwordMinLength': 'La contraseña debe tener al menos 6 caracteres',
    'login.loginFailed': 'Error de inicio de sesión',
    'login.unexpectedError': 'Ocurrió un error inesperado',
    'login.emailPlaceholder': 'Ingresa tu correo electrónico',
    'login.passwordPlaceholder': 'Ingresa tu contraseña',
    'login.signIn': 'Iniciar sesión'
  },
  ja: {
    'settings.title': '設定',
    'settings.subtitle': 'アプリケーションの設定をカスタマイズ',
    'settings.appearance': '外観',
    'settings.notifications': '通知',
    'settings.general': '一般',
    'settings.language': '言語',
    'settings.country': '国',
    'settings.currency': '通貨',
    'settings.timezone': 'タイムゾーン',
    'settings.save': '設定を保存',
    'settings.reset': 'デフォルトにリセット',
    'settings.theme': 'テーマ',
    'settings.quickToggle': 'クイック切り替え',
    'settings.currentTheme': '現在のテーマ',
    'settings.enableNotifications': '通知を有効にする',
    'settings.emailNotifications': 'メール通知',
    'settings.pushNotifications': 'プッシュ通知',
    'settings.autoSave': '自動保存',
    'dashboard.title': 'ダッシュボード',
    'dashboard.welcome': 'おかえりなさい！ビジネスの概要をご覧ください。',
    'dashboard.overview': '概要',
    'dashboard.searchFilters': '検索とフィルター',
    'dashboard.ordersCompleted': '完了した注文',
    'dashboard.activeBuyers': 'アクティブな購入者',
    'dashboard.totalRevenue': '総収益',
    'dashboard.conversionRate': 'コンバージョン率',
    'dashboard.analyticsReports': '分析とレポート',
    'sidebar.dashboard': 'ダッシュボード',
    'sidebar.users': 'ユーザー',
    'sidebar.categories': 'カテゴリー',
    'sidebar.blogs': 'ブログ',
    'sidebar.bannerManagement': 'バナー管理',
    'sidebar.prescriptions': '処方箋',
    'sidebar.medicine': '薬',
    'sidebar.profile': 'プロフィール',
    'sidebar.settings': '設定',
    'header.profile': 'プロフィール',
    'header.settings': '設定',
    'header.contact': 'お問い合わせ',
    'header.help': 'ヘルプ',
    'header.signOut': 'サインアウト',
    'login.emailRequired': 'メールアドレスが必要です',
    'login.emailInvalid': 'メールアドレスが無効です',
    'login.passwordRequired': 'パスワードが必要です',
    'login.passwordMinLength': 'パスワードは6文字以上である必要があります',
    'login.loginFailed': 'ログインに失敗しました',
    'login.unexpectedError': '予期しないエラーが発生しました',
    'login.emailPlaceholder': 'メールアドレスを入力してください',
    'login.passwordPlaceholder': 'パスワードを入力してください',
    'login.signIn': 'サインイン'
  },
  zh: {
    'settings.title': '设置',
    'settings.subtitle': '自定义您的应用程序偏好',
    'settings.appearance': '外观',
    'settings.notifications': '通知',
    'settings.general': '常规',
    'settings.language': '语言',
    'settings.country': '国家',
    'settings.currency': '货币',
    'settings.timezone': '时区',
    'settings.save': '保存设置',
    'settings.reset': '重置为默认',
    'settings.theme': '主题',
    'settings.quickToggle': '快速切换',
    'settings.currentTheme': '当前主题',
    'settings.enableNotifications': '启用通知',
    'settings.emailNotifications': '邮件通知',
    'settings.pushNotifications': '推送通知',
    'settings.autoSave': '自动保存',
    'dashboard.title': '仪表板',
    'dashboard.welcome': '欢迎回来！这是您的业务概览。',
    'dashboard.overview': '概览',
    'dashboard.searchFilters': '搜索和筛选',
    'dashboard.ordersCompleted': '已完成的订单',
    'dashboard.activeBuyers': '活跃买家',
    'dashboard.totalRevenue': '总收入',
    'dashboard.conversionRate': '转化率',
    'dashboard.analyticsReports': '分析和报告',
    'sidebar.dashboard': '仪表板',
    'sidebar.users': '用户',
    'sidebar.categories': '分类',
    'sidebar.blogs': '博客',
    'sidebar.bannerManagement': '横幅管理',
    'sidebar.prescriptions': '处方',
    'sidebar.medicine': '药品',
    'sidebar.profile': '个人资料',
    'sidebar.settings': '设置',
    'header.profile': '个人资料',
    'header.settings': '设置',
    'header.contact': '联系',
    'header.help': '帮助',
    'header.signOut': '退出登录',
    'login.emailRequired': '需要邮箱地址',
    'login.emailInvalid': '邮箱地址无效',
    'login.passwordRequired': '需要密码',
    'login.passwordMinLength': '密码至少需要6个字符',
    'login.loginFailed': '登录失败',
    'login.unexpectedError': '发生意外错误',
    'login.emailPlaceholder': '输入您的邮箱地址',
    'login.passwordPlaceholder': '输入您的密码',
    'login.signIn': '登录'
  },
  hi: {
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपनी एप्लिकेशन प्राथमिकताओं को कस्टमाइज़ करें',
    'settings.appearance': 'दिखावट',
    'settings.notifications': 'सूचनाएं',
    'settings.general': 'सामान्य',
    'settings.language': 'भाषा',
    'settings.country': 'देश',
    'settings.currency': 'मुद्रा',
    'settings.timezone': 'समय क्षेत्र',
    'settings.save': 'सेटिंग्स सेव करें',
    'settings.reset': 'डिफ़ॉल्ट पर रीसेट करें',
    'settings.theme': 'थीम',
    'settings.quickToggle': 'त्वरित टॉगल',
    'settings.currentTheme': 'वर्तमान थीम',
    'settings.enableNotifications': 'सूचनाएं सक्षम करें',
    'settings.emailNotifications': 'ईमेल सूचनाएं',
    'settings.pushNotifications': 'पुश सूचनाएं',
    'settings.autoSave': 'ऑटो सेव',
    'dashboard.title': 'डैशबोर्ड',
    'dashboard.welcome': 'वापस स्वागत है! यहां आपका व्यापार अवलोकन है।',
    'dashboard.overview': 'अवलोकन',
    'dashboard.searchFilters': 'खोज और फिल्टर',
    'dashboard.ordersCompleted': 'पूर्ण आदेश',
    'dashboard.activeBuyers': 'सक्रिय खरीदार',
    'dashboard.totalRevenue': 'कुल राजस्व',
    'dashboard.conversionRate': 'रूपांतरण दर',
    'dashboard.analyticsReports': 'विश्लेषण और रिपोर्ट',
    'sidebar.dashboard': 'डैशबोर्ड',
    'sidebar.users': 'उपयोगकर्ता',
    'sidebar.categories': 'श्रेणियां',
    'sidebar.blogs': 'ब्लॉग',
    'sidebar.bannerManagement': 'बैनर प्रबंधन',
    'sidebar.prescriptions': 'पर्चे',
    'sidebar.medicine': 'दवा',
    'sidebar.profile': 'प्रोफ़ाइल',
    'sidebar.settings': 'सेटिंग्स',
    'header.profile': 'प्रोफ़ाइल',
    'header.settings': 'सेटिंग्स',
    'header.contact': 'संपर्क',
    'header.help': 'सहायता',
    'header.signOut': 'साइन आउट',
    'login.emailRequired': 'ईमेल आवश्यक है',
    'login.emailInvalid': 'ईमेल अमान्य है',
    'login.passwordRequired': 'पासवर्ड आवश्यक है',
    'login.passwordMinLength': 'पासवर्ड कम से कम 6 वर्ण का होना चाहिए',
    'login.loginFailed': 'लॉगिन विफल',
    'login.unexpectedError': 'एक अप्रत्याशित त्रुटि हुई',
    'login.emailPlaceholder': 'अपना ईमेल दर्ज करें',
    'login.passwordPlaceholder': 'अपना पासवर्ड दर्ज करें',
    'login.signIn': 'साइन इन'
  }
};

interface LocaleProviderProps {
  children: ReactNode;
}

export const LocaleProvider = ({ children }: LocaleProviderProps): React.JSX.Element => {
  const [locale, setLocaleState] = useState<LocaleConfig>(() => {
    const savedCountry = localStorage.getItem('curebasket-locale') as Country;
    const countryData = savedCountry ? getCountryByCode(savedCountry) : countries[0]; // Default to first country (US)
    return countryData ? countryDataToLocaleConfig(countryData) : countryDataToLocaleConfig(countries[0]);
  });

  const setLocale = (country: Country): void => {
    const countryData = getCountryByCode(country);
    if (countryData) {
      const newLocale = countryDataToLocaleConfig(countryData);
      setLocaleState(newLocale);
      localStorage.setItem('curebasket-locale', country);
      
      // Update document language
      document.documentElement.lang = newLocale.language;
    }
  };

  const formatCurrency = (amount: number): string => {
    const formatter = new Intl.NumberFormat(locale.numberFormat, {
      style: 'currency',
      currency: locale.currency,
    });
    return formatter.format(amount);
  };

  const formatDate = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat(locale.numberFormat, {
      timeZone: locale.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  };

  const formatNumber = (number: number): string => {
    const formatter = new Intl.NumberFormat(locale.numberFormat);
    return formatter.format(number);
  };

  const t = (key: string): string => {
    return translations[locale.language]?.[key] || translations.en[key] || key;
  };

  const value: LocaleContextType = {
    locale,
    setLocale,
    formatCurrency,
    formatDate,
    formatNumber,
    t
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};
