'use client';

import { motion } from 'framer-motion';
import { 
  FoxPaysOrderStatus as OrderStatusType, 
  FoxPaysSubStatus,
  ORDER_STATUS_MAP, 
  ORDER_SUB_STATUS_MAP 
} from '@/types/foxpays';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react';

interface FoxPaysOrderStatusProps {
  status: OrderStatusType;
  subStatus: FoxPaysSubStatus;
  showCancel?: boolean;
  onCancel?: () => void;
  onRetry?: () => void;
  loading?: boolean;
  className?: string;
}

function getStatusIcon(status: OrderStatusType, subStatus: FoxPaysSubStatus) {
  if (status === 'success') {
    return <CheckCircle className="w-6 h-6 text-green-500" />;
  }
  if (status === 'fail') {
    return <XCircle className="w-6 h-6 text-red-500" />;
  }
  
  // Pending states
  switch (subStatus) {
    case 'waiting_for_payment':
      return <Clock className="w-6 h-6 text-yellow-500" />;
    case 'waiting_details_to_be_selected':
      return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
    case 'waiting_for_dispute_to_be_resolved':
      return <AlertCircle className="w-6 h-6 text-orange-500" />;
    case 'expired':
      return <XCircle className="w-6 h-6 text-gray-500" />;
    case 'cancelled':
    case 'canceled_by_dispute':
      return <XCircle className="w-6 h-6 text-red-500" />;
    default:
      return <Clock className="w-6 h-6 text-yellow-500" />;
  }
}

function getStatusColor(status: OrderStatusType, subStatus: FoxPaysSubStatus): string {
  if (status === 'success') return 'text-green-400';
  if (status === 'fail') return 'text-red-400';
  
  switch (subStatus) {
    case 'expired':
    case 'cancelled':
    case 'canceled_by_dispute':
      return 'text-red-400';
    case 'waiting_for_dispute_to_be_resolved':
      return 'text-orange-400';
    default:
      return 'text-yellow-400';
  }
}

function getStatusBgColor(status: OrderStatusType, subStatus: FoxPaysSubStatus): string {
  if (status === 'success') return 'bg-green-500/10 border-green-500/20';
  if (status === 'fail') return 'bg-red-500/10 border-red-500/20';
  
  switch (subStatus) {
    case 'expired':
    case 'cancelled':
    case 'canceled_by_dispute':
      return 'bg-red-500/10 border-red-500/20';
    case 'waiting_for_dispute_to_be_resolved':
      return 'bg-orange-500/10 border-orange-500/20';
    default:
      return 'bg-yellow-500/10 border-yellow-500/20';
  }
}

export function FoxPaysOrderStatus({
  status,
  subStatus,
  showCancel = false,
  onCancel,
  onRetry,
  loading = false,
  className = '',
}: FoxPaysOrderStatusProps) {
  const statusText = ORDER_STATUS_MAP[status] || status;
  const subStatusText = ORDER_SUB_STATUS_MAP[subStatus] || subStatus;
  const isPending = status === 'pending';
  const canCancel = isPending && showCancel && subStatus !== 'expired' && subStatus !== 'cancelled';
  const canRetry = status === 'fail' || subStatus === 'expired';

  return (
    <motion.div
      className={`p-4 rounded-xl border ${getStatusBgColor(status, subStatus)} ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="flex items-center gap-3">
        {getStatusIcon(status, subStatus)}
        
        <div className="flex-1">
          <div className={`font-semibold ${getStatusColor(status, subStatus)}`}>
            {subStatusText}
          </div>
          <div className="text-gray-400 text-sm">
            Статус: {statusText}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {canRetry && onRetry && (
            <motion.button
              onClick={onRetry}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4" />
              Повторить
            </motion.button>
          )}
          
          {canCancel && onCancel && (
            <motion.button
              onClick={onCancel}
              disabled={loading}
              className="px-3 py-2 rounded-lg border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 text-sm disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Отменить
            </motion.button>
          )}
        </div>
      </div>

      {/* Additional info for specific states */}
      {subStatus === 'waiting_for_payment' && (
        <div className="mt-3 text-gray-400 text-sm">
          Ожидаем подтверждения оплаты. Это может занять несколько минут.
        </div>
      )}
      
      {subStatus === 'waiting_for_dispute_to_be_resolved' && (
        <div className="mt-3 text-orange-400 text-sm">
          Ваш платёж находится на рассмотрении. Мы свяжемся с вами в ближайшее время.
        </div>
      )}
      
      {subStatus === 'expired' && (
        <div className="mt-3 text-gray-400 text-sm">
          Время на оплату истекло. Создайте новый заказ для продолжения.
        </div>
      )}
      
      {status === 'success' && (
        <div className="mt-3 text-green-400 text-sm">
          Платёж успешно обработан! Криптовалюта будет отправлена на ваш кошелёк.
        </div>
      )}
    </motion.div>
  );
}
