'use client';

import { useState, useEffect, useCallback } from 'react';

export type AdminRole = 'superadmin' | 'operator';

export interface Admin {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  createdAt: Date;
}

// Default admins (hardcoded for all devices)
const defaultAdmins: Admin[] = [
  {
    id: '1',
    email: 'admin@crypto.com',
    password: 'admin123',
    name: 'Главный админ',
    role: 'superadmin',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'support@crypto.com',
    password: '12345678',
    name: 'Оператор',
    role: 'operator',
    createdAt: new Date(),
  },
];

const ADMINS_KEY = 'foxswap_admins';
const CURRENT_ADMIN_KEY = 'foxswap_current_admin';

function getStoredAdmins(): Admin[] {
  if (typeof window === 'undefined') return defaultAdmins;
  const stored = localStorage.getItem(ADMINS_KEY);
  if (stored) {
    try {
      const admins = JSON.parse(stored);
      return admins.map((a: any) => ({
        ...a,
        createdAt: new Date(a.createdAt),
      }));
    } catch {
      localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
      return defaultAdmins;
    }
  }
  localStorage.setItem(ADMINS_KEY, JSON.stringify(defaultAdmins));
  return defaultAdmins;
}

function saveAdmins(admins: Admin[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
}

export function useAdmins() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAdmins(getStoredAdmins());
    
    // Load current admin from localStorage
    const storedCurrentAdmin = localStorage.getItem(CURRENT_ADMIN_KEY);
    if (storedCurrentAdmin) {
      try {
        const admin = JSON.parse(storedCurrentAdmin);
        setCurrentAdmin({
          ...admin,
          createdAt: new Date(admin.createdAt),
        });
      } catch {
        localStorage.removeItem(CURRENT_ADMIN_KEY);
      }
    }
    
    setLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): Admin | null => {
    // First check hardcoded admins
    const hardcodedAdmin = defaultAdmins.find(a => a.email === email && a.password === password);
    if (hardcodedAdmin) {
      setCurrentAdmin(hardcodedAdmin);
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(hardcodedAdmin));
      localStorage.setItem('adminAuth', 'true');
      return hardcodedAdmin;
    }
    // Then check localStorage admins
    const storedAdmins = getStoredAdmins();
    const admin = storedAdmins.find(a => a.email === email && a.password === password);
    if (admin) {
      setCurrentAdmin(admin);
      localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(admin));
      localStorage.setItem('adminAuth', 'true');
      return admin;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    setCurrentAdmin(null);
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    localStorage.removeItem('adminAuth');
  }, []);

  const addAdmin = useCallback((data: Omit<Admin, 'id' | 'createdAt'>) => {
    const newAdmin: Admin = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updated = [...admins, newAdmin];
    setAdmins(updated);
    saveAdmins(updated);
    return newAdmin;
  }, [admins]);

  const updateAdmin = useCallback((id: string, data: Partial<Admin>) => {
    const updated = admins.map(a => a.id === id ? { ...a, ...data } : a);
    setAdmins(updated);
    saveAdmins(updated);
  }, [admins]);

  const deleteAdmin = useCallback((id: string) => {
    // Prevent deleting the last superadmin
    const superadmins = admins.filter(a => a.role === 'superadmin');
    const adminToDelete = admins.find(a => a.id === id);
    if (adminToDelete?.role === 'superadmin' && superadmins.length <= 1) {
      return false;
    }
    const updated = admins.filter(a => a.id !== id);
    setAdmins(updated);
    saveAdmins(updated);
    return true;
  }, [admins]);

  const isSuperAdmin = currentAdmin?.role === 'superadmin';
  const isOperator = currentAdmin?.role === 'operator';

  return {
    admins,
    currentAdmin,
    loading,
    login,
    logout,
    addAdmin,
    updateAdmin,
    deleteAdmin,
    isSuperAdmin,
    isOperator,
  };
}
