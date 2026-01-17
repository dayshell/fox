// Migration utility to clean up old FoxPays orders with payment details
export function migrateLocalStorage() {
  if (typeof window === 'undefined') return;

  try {
    const ordersData = localStorage.getItem('foxpaysOrders');
    if (!ordersData) return;

    const orders = JSON.parse(ordersData);
    
    // Clean payment details from all orders
    const cleanedOrders = orders.map((order: any) => ({
      ...order,
      paymentDetail: {
        detail: '',
        detailType: 'card' as const,
        initials: '',
        qrCodeUrl: undefined,
      },
    }));

    localStorage.setItem('foxpaysOrders', JSON.stringify(cleanedOrders));
    console.log('[Migration] Cleaned payment details from localStorage');
  } catch (e) {
    console.error('[Migration] Failed to migrate localStorage:', e);
  }
}
