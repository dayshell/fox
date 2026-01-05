'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useFoxPaysOrderStatus, formatRemainingTime } from '@/hooks/useFoxPaysOrderStatus';
import { useFoxPaysOrder } from '@/hooks/useFoxPaysOrder';
import { useLanguage } from '@/context/LanguageContext';
import { CopyButton } from '@/components/CopyButton';
import { PaymentTimer } from '@/components/PaymentTimer';
import { 
  CheckCircle, Clock, AlertCircle, ArrowLeft, 
  CreditCard, Smartphone, QrCode, Building2, User, X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderStatusPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { t } = useLanguage();
  
  const { status, loading, error, isExpired, isCompleted, isFailed, remainingTime } = 
    useFoxPaysOrderStatus(orderId, true);
  const { confirmPayment, cancelOrder, loading: actionLoading } = useFoxPaysOrder();
  
  const [localOrder, setLocalOrder] = useState<any>(null);

  // Load order from localStorage
  useEffect(() => {
    if (orderId) {
      try {
        const orders = JSON.parse(localStorage.getItem('foxpaysOrders') || '[]');
        const order = orders.find((o: any) => o.foxpaysOrderId === orderId || o.id === orderId);
        if (order) {
          setLocalOrder(order);
        }
      } catch (e) {
        console.error('Failed to load order from localStorage');
      }
    }
  }, [orderId]);

  const handleConfirm = async () => {
    const success = await confirmPayment(orderId);
    if (success) {
      // Refresh status
      window.location.reload();
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

  const formatCardNumber = (card: string): string => {
    return card.replace(/(.{4})/g, '$1 ').trim();
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

  const order = localOrder;
  const isPending = status?.status === 'pending' || (!status && order?.status === 'pending');

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


        {/* Payment Details - only show if pending */}
        {isPending && order?.paymentDetail && (
          <motion.div
            className="card-dark p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('foxpays.paymentDetails')}
            </h3>

            {/* Amount to pay */}
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">{t('foxpays.amountToPay')}</div>
              <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <span className="text-2xl font-bold text-orange-400">
                  {formatAmount(order.amount)} {order.currency?.toUpperCase() || 'RUB'}
                </span>
                <CopyButton text={order.amount?.toString() || ''} size="sm" />
              </div>
            </div>

            {/* Payment detail based on type */}
            {order.paymentDetail.detailType === 'card' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <CreditCard className="w-4 h-4" />
                  <span>{t('foxpays.cardNumber')}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                  <code className="flex-1 text-white text-lg font-mono tracking-wider">
                    {formatCardNumber(order.paymentDetail.detail)}
                  </code>
                  <CopyButton text={order.paymentDetail.detail} size="md" />
                </div>
              </div>
            )}

            {order.paymentDetail.detailType === 'phone' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Smartphone className="w-4 h-4" />
                  <span>{t('foxpays.phoneNumber')}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                  <code className="flex-1 text-white text-lg font-mono">
                    {order.paymentDetail.detail}
                  </code>
                  <CopyButton text={order.paymentDetail.detail} size="md" />
                </div>
              </div>
            )}

            {order.paymentDetail.detailType === 'qrcode' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <QrCode className="w-4 h-4" />
                  <span>{t('foxpays.qrCode')}</span>
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-xl">
                    {order.paymentDetail.qrCodeUrl ? (
                      <Image
                        src={order.paymentDetail.qrCodeUrl}
                        alt="QR Code"
                        width={200}
                        height={200}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                        QR-код недоступен
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-center text-gray-400 text-sm">
                  {t('foxpays.scanQrCode')}
                </p>
              </div>
            )}

            {order.paymentDetail.detailType === 'account_number' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Building2 className="w-4 h-4" />
                  <span>{t('foxpays.accountNumber')}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                  <code className="flex-1 text-white text-lg font-mono">
                    {order.paymentDetail.detail}
                  </code>
                  <CopyButton text={order.paymentDetail.detail} size="md" />
                </div>
              </div>
            )}

            {/* Recipient */}
            {order.paymentDetail.initials && (
              <div className="mt-4 p-4 bg-dark-input rounded-xl">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{t('foxpays.recipient')}:</span>
                  <span className="text-white font-medium">{order.paymentDetail.initials}</span>
                </div>
              </div>
            )}

            {/* Timer */}
            {order.expiresAt && (
              <div className="mt-6">
                <PaymentTimer
                  expiresAt={order.expiresAt}
                  onExpire={() => window.location.reload()}
                />
              </div>
            )}

            {/* Warning */}
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-yellow-500 text-sm">
                ⚠️ {t('foxpays.exactAmountWarning', { amount: formatAmount(order.amount), currency: order.currency?.toUpperCase() || 'RUB' })}
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
        {isPending && (
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
        )}
      </div>
    </div>
  );
}
