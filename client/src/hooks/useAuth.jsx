import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'wm_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = { user, login, logout, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

export const ROLES = {
  CUSTOMER: 'customer',
  FUND_MANAGER: 'fund_manager',
  SERVICE_PROVIDER: 'service_provider',
};

export const ROLE_LABELS = {
  [ROLES.CUSTOMER]: 'Customer',
  [ROLES.FUND_MANAGER]: 'Fund Manager',
  [ROLES.SERVICE_PROVIDER]: 'Service Provider',
};

export const ROLE_PATHS = {
  [ROLES.CUSTOMER]: '/customer',
  [ROLES.FUND_MANAGER]: '/fund-manager',
  [ROLES.SERVICE_PROVIDER]: '/service-provider',
};
