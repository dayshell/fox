'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ExchangeOrder, ORDER_SUB_STATUS_MAP } from '@/types/foxpays';
import { CopyButton } from './CopyButton';
import { PaymentTimer } from './PaymentTimer';
import { CreditCard, Smartphone, QrCode, User, Building2 } from 'lucide-react';

interface FoxPaysPaymentDetailsProps {
  order: ExchangeOrder;
  onConfirm: () => void;
  onCancel: () => void;
  onExpire?: () => void;
  loading?: boolean;
  className?: string;
}

export function FoxPaysPaymentDetails({
  order,
  onConfirm,
  onCancel,
  onExpire,
  loading = false,
  className = '',
}: FoxPaysPaymentDetailsProps) {
  const { paymentDetail, amount, currency, paymentGatewayName, expiresAt, status, subStatus } = order;

  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatCardNumber = (card: string): string => {
    // Format as XXXX XXXX XXXX XXXX
    return card.replace(/(.{4})/g, '$1 ').trim();
  };

  const renderPaymentDetail = () => {
    switch (paymentDetail.detailType) {
      case 'card':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <CreditCard className="w-4 h-4" />
              <span>Номер карты</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
              <code className="flex-1 text-white text-lg font-mono tracking-wider">
                {formatCardNumber(paymentDetail.detail)}
              </code>
              <CopyButton text={paymentDetail.detail} size="md" />
            </div>
          </div>
        );

      case 'phone':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Smartphone className="w-4 h-4" />
              <span>Номер телефона</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
              <code className="flex-1 text-white text-lg font-mono">
                {paymentDetail.detail}
              </code>
              <CopyButton text={paymentDetail.detail} size="md" />
            </div>
          </div>
        );

      case 'qrcode':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <QrCode className="w-4 h-4" />
              <span>QR-код для оплаты</span>
            </div>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-xl">
                {paymentDetail.qrCodeUrl ? (
                  <Image
                    src={paymentDetail.qrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                ) : paymentDetail.detail.startsWith('data:image') ? (
                  <img
                    src={paymentDetail.detail}
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
              Отсканируйте QR-код в приложении банка
            </p>
          </div>
        );

      case 'account_number':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Building2 className="w-4 h-4" />
              <span>Номер счёта</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
              <code className="flex-1 text-white text-lg font-mono">
                {paymentDetail.detail}
              </code>
              <CopyButton text={paymentDetail.detail} size="md" />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-dark-input rounded-xl">
            <code className="text-white font-mono break-all">
              {paymentDetail.detail}
            </code>
          </div>
        );
    }
  };

  const isPending = status === 'pending';

  return (
    <motion.div
      className={`card-dark p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">
          Оплатите заказ
        </h3>
        <div className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-400">
          {paymentGatewayName}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-6">
        <div className="text-gray-400 text-sm mb-2">Сумма к оплате</div>
        <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
          <span className="text-2xl font-bold text-orange-400">
            {formatAmount(amount)} {currency.toUpperCase()}
          </span>
          <CopyButton text={amount.toString()} size="sm" />
        </div>
      </div>

      {/* Payment Details */}
      <div className="mb-6">
        {renderPaymentDetail()}
      </div>

      {/* Recipient */}
      {paymentDetail.initials && (
        <div className="mb-6 p-4 bg-dark-input rounded-xl">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Получатель:</span>
            <span className="text-white font-medium">{paymentDetail.initials}</span>
          </div>
        </div>
      )}

      {/* Timer */}
      {isPending && (
        <div className="mb-6">
          <PaymentTimer
            expiresAt={expiresAt}
            onExpire={onExpire}
          />
        </div>
      )}

      {/* Status */}
      {!isPending && (
        <div className="mb-6 p-4 bg-gray-800 rounded-xl">
          <div className="text-gray-400 text-sm">Статус</div>
          <div className={`font-medium ${
            status === 'success' ? 'text-green-400' : 
            status === 'fail' ? 'text-red-400' : 
            'text-yellow-400'
          }`}>
            {ORDER_SUB_STATUS_MAP[subStatus] || subStatus}
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
        <p className="text-yellow-500 text-sm">
          ⚠️ Переводите точную сумму {formatAmount(amount)} {currency.toUpperCase()}. 
          При несовпадении суммы платёж может быть отклонён.
        </p>
      </div>

      {/* Actions */}
      {isPending && (
        <div className="flex gap-3">
          <motion.button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-4 text-lg font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Подтверждение...' : 'Я оплатил'}
          </motion.button>
          <motion.button
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            Отмена
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
