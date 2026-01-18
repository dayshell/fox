// Payment Details Display - Clean Version
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFoxPaysOrderStatus } from '@/hooks/useFoxPaysOrderStatus';
import { useFoxPaysOrder } from '@/hooks/useFoxPaysOrder';
import { useLanguage } from '@/context/LanguageContext';
import { CopyButton } from '@/components/CopyButton';
import { PaymentTimer } from '@/components/PaymentTimer';
import { 
  CheckCircle, Clock, AlertCircle, ArrowLeft, X
} from 'lucide-react';
import Link from 'next/link';

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = (params?.orderId as string) || '';
  const { t } = useLanguage();
  
  console.log('[Order Page] ===== COMPONENT MOUNT =====');
  console.log('[Order Page] params:', params);
  console.log('[Order Page] orderId:', orderId);
  console.log('[Order Page] orderId length:', orderId.length);
  
  const { status, loading, error, isExpired, isCompleted, isFailed, refetch } = 
    useFoxPaysOrderStatus(orderId, true);
  const { confirmPayment, cancelOrder, loading: actionLoading } = useFoxPaysOrder();
  
  const [localOrder, setLocalOrder] = useState<any>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  // Load order from localStorage
  useEffect(() => {
    if (orderId) {
      console.log('[Order Page] Loading order with ID:', orderId);
      try {
        const orders = JSON.parse(localStorage.getItem('foxpaysOrders') || '[]');
        console.log('[Order Page] All orders from localStorage:', orders);
        const order = orders.find((o: any) => o.foxpaysOrderId === orderId || o.id === orderId);
        console.log('[Order Page] Found order:', order);
        if (order) {
          setLocalOrder(order);
        } else {
          console.warn('[Order Page] Order not found in localStorage');
        }
      } catch (e) {
        console.error('Failed to load order from localStorage', e);
      }
    }
  }, [orderId]);

  // Stop confirming state when status changes
  useEffect(() => {
    if (isConfirming && (isCompleted || isFailed)) {
      setIsConfirming(false);
    }
  }, [isConfirming, isCompleted, isFailed]);

  const handleConfirm = async () => {
    setIsConfirming(true);
    setConfirmError(null);
    const success = await confirmPayment(orderId);
    if (success) {
      // Poll for status updates with multiple attempts
      let attempts = 0;
      const maxAttempts = 5;
      const checkInterval = 2000; // 2 seconds
      
      const checkStatus = async () => {
        attempts++;
        await refetch();
        
        // Check if status changed (will be handled by the hook's state update)
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, checkInterval);
        } else {
          setIsConfirming(false);
        }
      };
      
      setTimeout(checkStatus, 2000);
    } else {
      setConfirmError('Не удалось подтвердить платеж. Попробуйте еще раз.');
      setIsConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (confirm(t('foxpays.confirmCancel') || 'Вы уверены, что хотите отменить заказ?')) {
      const success = await cancelOrder(orderId);
      if (success) {
        router.push('/');
      }
    }
  };

  const formatAmount = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };


  if (loading && !status && !localOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !localOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">{t('exchange.error')}</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            {t('exchange.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Use FoxPays API data as primary source
  const order = status || localOrder;
  const isPending = status?.status === 'pending' || (!status && localOrder?.status === 'pending');
  
  // Use payment details from FoxPays API, NOT from localStorage
  const paymentDetail = status?.paymentDetail;
  
  // Debug logging
  console.log('[Order Page Render] ===== DEBUG START =====');
  console.log('[Order Page Render] status:', status);
  console.log('[Order Page Render] localOrder:', localOrder);
  console.log('[Order Page Render] status?.paymentDetail:', status?.paymentDetail);
  console.log('[Order Page Render] paymentDetail:', paymentDetail);
  console.log('[Order Page Render] paymentDetail?.detail:', paymentDetail?.detail);
  console.log('[Order Page Render] paymentDetail?.detail_type:', paymentDetail?.detail_type);
  console.log('[Order Page Render] isPending:', isPending);
  console.log('[Order Page Render] orderId:', orderId);
  console.log('[Order Page Render] ===== DEBUG END =====');

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Back button */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('exchange.backHome')}
        </Link>

        {/* Order Status Header */}
        <motion.div
          className="card-dark p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">{t('exchange.order')} #{orderId.slice(0, 8)}...</span>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isCompleted ? 'bg-green-500/20 text-green-400' :
              isFailed || isExpired ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isCompleted ? <CheckCircle className="w-4 h-4" /> :
               isFailed || isExpired ? <X className="w-4 h-4" /> :
               <Clock className="w-4 h-4" />}
              <span className="text-sm">
                {isCompleted ? t('foxpays.statusSuccess') :
                 isFailed ? t('foxpays.statusFailed') :
                 isExpired ? t('foxpays.statusExpired') :
                 t('foxpays.statusPending')}
              </span>
            </div>
          </div>

          {/* Order details */}
          {order && (
            <div className="p-4 bg-dark-input rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{t('foxpays.amount')}</span>
                <span className="text-white font-semibold">
                  {formatAmount(order.amount || status?.amount || 0)} {order.currency || status?.currency || 'RUB'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('foxpays.paymentMethod')}</span>
                <span className="text-white">{order.paymentGatewayName || status?.paymentGatewayName}</span>
              </div>
            </div>
          )}
        </motion.div>


        {/* Payment Details - Loading state */}
        {isPending && !paymentDetail && (
          <motion.div
            className="card-dark p-6 mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Загрузка реквизитов для оплаты...</p>
          </motion.div>
        )}

        {/* Debug: Show if paymentDetail exists but detail is missing */}
        {isPending && paymentDetail && !paymentDetail.detail && (
          <motion.div
            className="card-dark p-6 mb-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-yellow-400">Реквизиты получены, но данные неполные</p>
            <pre className="text-xs text-gray-400 mt-2 text-left overflow-auto">
              {JSON.stringify(paymentDetail, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* Payment Details - Show when available */}
        {isPending && paymentDetail && paymentDetail.detail && (
          <motion.div
            className="card-dark p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Данные для оплаты
            </h3>

            {/* Amount */}
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">Сумма к оплате</div>
              <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <span className="text-2xl font-bold text-orange-400">
                  {formatAmount(order?.amount || status?.amount || 0)} {(order?.currency || status?.currency || 'RUB').toUpperCase()}
                </span>
                <CopyButton text={(order?.amount || status?.amount || 0).toString()} size="sm" />
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-4 mb-6">
              {/* Main payment detail (card/phone/account) */}
              <div>
                <div className="text-gray-400 text-sm mb-2">
                  {paymentDetail.detail_type === 'card' && 'Номер карты'}
                  {paymentDetail.detail_type === 'phone' && 'Номер телефона'}
                  {paymentDetail.detail_type === 'account_number' && 'Номер счета'}
                  {paymentDetail.detail_type === 'qrcode' && 'QR-код'}
                  {!paymentDetail.detail_type && 'Реквизиты'}
                </div>
                <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                  <span className="text-lg font-mono text-white flex-1">
                    {paymentDetail.detail || 'Нет данных'}
                  </span>
                  {paymentDetail.detail && <CopyButton text={paymentDetail.detail} size="sm" />}
                </div>
                {/* Debug info */}
                <div className="mt-2 p-2 bg-gray-800 rounded text-xs text-gray-400">
                  <div>detail_type: {paymentDetail.detail_type || 'undefined'}</div>
                  <div>detail length: {paymentDetail.detail?.length || 0}</div>
                  <div>detail value: {JSON.stringify(paymentDetail.detail)}</div>
                </div>
              </div>

              {/* Recipient name */}
              {paymentDetail.initials && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Получатель</div>
                  <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                    <span className="text-lg text-white flex-1">
                      {paymentDetail.initials}
                    </span>
                    <CopyButton text={paymentDetail.initials} size="sm" />
                  </div>
                </div>
              )}

              {/* QR Code if available */}
              {paymentDetail.qr_code_url && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">QR-код для оплаты</div>
                  <div className="p-4 bg-dark-input rounded-xl flex justify-center">
                    <img 
                      src={paymentDetail.qr_code_url} 
                      alt="QR код для оплаты"
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Timer */}
            {status?.expiresAt && (
              <div className="mb-6">
                <PaymentTimer
                  expiresAt={status.expiresAt}
                  onExpire={() => window.location.reload()}
                />
              </div>
            )}

            {/* Warning */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-yellow-500 text-sm">
                ⚠️ Переводите точную сумму {formatAmount(order?.amount || status?.amount || 0)} {(order?.currency || status?.currency || 'RUB').toUpperCase()}
              </p>
            </div>
          </motion.div>
        )}


        {/* Success State */}
        {isCompleted && (
          <motion.div
            className="card-dark p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div 
              className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <CheckCircle className="w-12 h-12 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {t('foxpays.paymentSuccess')}
            </h2>
            <p className="text-gray-400 mb-6">
              {t('foxpays.paymentSuccessDesc')}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors"
            >
              {t('exchange.backHome')}
            </Link>
          </motion.div>
        )}

        {/* Failed/Expired State */}
        {(isFailed || isExpired) && (
          <motion.div
            className="card-dark p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6">
              <X className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isExpired ? t('foxpays.paymentExpired') : t('foxpays.paymentFailed')}
            </h2>
            <p className="text-gray-400 mb-6">
              {isExpired ? t('foxpays.paymentExpiredDesc') : t('foxpays.paymentFailedDesc')}
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors"
            >
              {t('foxpays.tryAgain')}
            </Link>
          </motion.div>
        )}

        {/* Action Buttons - only show if pending */}
        {isPending && !isConfirming && (
          <>
            {/* Confirmation Error */}
            {confirmError && (
              <motion.div
                className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>{confirmError}</span>
                </div>
              </motion.div>
            )}
            
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.button
                onClick={handleConfirm}
                disabled={actionLoading}
                className="flex-1 py-4 text-lg font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                whileTap={{ scale: actionLoading ? 1 : 0.98 }}
              >
                {actionLoading ? t('foxpays.confirming') : t('foxpays.iPaid')}
              </motion.button>
              <motion.button
                onClick={handleCancel}
                disabled={actionLoading}
                className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50"
                whileHover={{ scale: actionLoading ? 1 : 1.02 }}
                whileTap={{ scale: actionLoading ? 1 : 0.98 }}
              >
                {t('foxpays.cancel')}
              </motion.button>
            </motion.div>
          </>
        )}

        {/* Confirming State */}
        {isConfirming && (
          <motion.div
            className="card-dark p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Проверяем платеж...
            </h3>
            <p className="text-gray-400">
              Пожалуйста, подождите. Это может занять несколько секунд.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
