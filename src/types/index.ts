// User types
export type UserRole = 'superadmin' | 'admin' | 'demo' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string | null;
  permissions?: string[];
}

// Authentication types
export interface AuthData {
  isAuthenticated: boolean;
  token: string;
  user: User;
  loginTime: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  redirectUrl?: string; // Optional redirect URL from backend
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Category types
export interface CategoryElement {
  id: number;
  name: string;
  isActive: boolean;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  isActive: boolean;
  elements: CategoryElement[];
}

export interface CategoryServiceResponse {
  success: boolean;
  data?: Category[];
  error?: string;
}

// Sidebar types
export interface SideBarItem {
  title: string;
  icon: string;
  key: string;
  link: string;
  isActive?: boolean;
  isVisible?: boolean;
  badge?: string | number;
}

// Component prop types
export interface LoginProps {
  onLoginSuccess?: (user: User) => void;
}

export interface SideBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isOpen?: boolean;
}

export interface SideBarTileProps {
  item: SideBarItem;
  isActive: boolean;
  onClick: () => void;
}

export interface CategoryCardProps {
  category: Category;
  onElementToggle: (elementId: number) => void;
}

export interface HeaderProps {
  onNavigate?: (view: string) => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

// Auth Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<LoginResponse>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
}
