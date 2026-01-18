'use client';

import { motion } from 'framer-motion';
import { FoxPaysPaymentGateway } from '@/types/foxpays';
import { CreditCard, Smartphone, QrCode, Building2, Check } from 'lucide-react';

interface PaymentGatewaySelectorProps {
  gateways: FoxPaysPaymentGateway[];
  selectedGateway: string | null;
  onSelect: (code: string) => void;
  amount: number;
  loading?: boolean;
  className?: string;
}

// Bank icons mapping
const BANK_ICONS: Record<string, string> = {
  sberbank: '🟢',
  tinkoff: '🟡',
  alfabank: '🔴',
  vtb: '🔵',
  raiffeisen: '🟡',
  gazprombank: '🔵',
  otkritie: '🔵',
  rosbank: '🔴',
  sbp: '⚡',
};

function getDetailTypeIcon(type: string) {
  switch (type) {
    case 'card':
      return <CreditCard className="w-4 h-4" />;
    case 'phone':
      return <Smartphone className="w-4 h-4" />;
    case 'qrcode':
      return <QrCode className="w-4 h-4" />;
    case 'account_number':
      return <Building2 className="w-4 h-4" />;
    default:
      return <CreditCard className="w-4 h-4" />;
  }
}

function formatLimit(value: string): string {
  const num = parseFloat(value);
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export function PaymentGatewaySelector({
  gateways,
  selectedGateway,
  onSelect,
  amount,
  loading = false,
  className = '',
}: PaymentGatewaySelectorProps) {
  // Filter gateways by amount and active status
  const availableGateways = gateways.filter(gateway => {
    const minLimit = parseFloat(gateway.min_limit);
    const maxLimit = parseFloat(gateway.max_limit);
    const isActive = gateway.is_active !== false; // Active by default if field is missing
    return amount >= minLimit && amount <= maxLimit && isActive;
  });

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-24 bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (availableGateways.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-yellow-500 text-sm">
            Нет доступных способов оплаты для суммы {amount} ₽
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableGateways.map((gateway, index) => {
          const isSelected = selectedGateway === gateway.code;
          const bankIcon = BANK_ICONS[gateway.code.toLowerCase()] || '🏦';

          return (
            <motion.button
              key={gateway.code}
              onClick={() => onSelect(gateway.code)}
              className={`
                relative p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                }
              `}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              {/* Bank icon and name */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{bankIcon}</span>
                <span className="text-white font-medium text-sm truncate">
                  {gateway.name}
                </span>
              </div>

              {/* Limits */}
              <div className="text-gray-400 text-xs mb-2">
                {formatLimit(gateway.min_limit)} - {formatLimit(gateway.max_limit)} {gateway.currency.toUpperCase()}
              </div>

              {/* Detail types */}
              <div className="flex items-center gap-1.5">
                {gateway.detail_types.map(type => (
                  <div
                    key={type}
                    className="text-gray-500"
                    title={type}
                  >
                    {getDetailTypeIcon(type)}
                  </div>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected gateway info */}
      {selectedGateway && (
        <motion.div
          className="mt-4 p-3 bg-gray-800/50 rounded-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          {(() => {
            const gateway = availableGateways.find(g => g.code === selectedGateway);
            if (!gateway) return null;
            return (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  Время на оплату: {gateway.reservation_time} мин
                </span>
                <span className="text-gray-400">
                  Лимит: {formatLimit(gateway.min_limit)} - {formatLimit(gateway.max_limit)} ₽
                </span>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
}
