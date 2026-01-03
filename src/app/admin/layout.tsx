'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useOrders } from '@/hooks/useOrders';
import { useNotificationSound } from '@/hooks/useNotificationSound';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { orders } = useOrders();
  const { playSound } = useNotificationSound();
  const prevOrderCountRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const auth = localStorage.getItem('adminAuth');
    if (!auth && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else {
      setIsAuth(true);
    }
    setLoading(false);
  }, [pathname, router, mounted]);

  // Track new orders and play sound
  useEffect(() => {
    if (orders.length > 0) {
      if (prevOrderCountRef.current !== null && orders.length > prevOrderCountRef.current) {
        // New order detected - play sound
        playSound();
      }
      prevOrderCountRef.current = orders.length;
    }
  }, [orders.length, playSound]);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isAuth) return null;

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
