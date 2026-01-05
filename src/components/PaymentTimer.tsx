'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface PaymentTimerProps {
  expiresAt: number; // Unix timestamp in seconds
  onExpire?: () => void;
  className?: string;
}

export function PaymentTimer({ expiresAt, onExpire, className = '' }: PaymentTimerProps) {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isExpired, setIsExpired] = useState(false);

  const calculateRemaining = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, expiresAt - now);
  }, [expiresAt]);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateRemaining();
      setRemainingTime(remaining);

      if (remaining === 0 && !isExpired) {
        setIsExpired(true);
        onExpire?.();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining, isExpired, onExpire]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const totalTime = 10 * 60; // Assume 10 minutes total (can be adjusted)
  const progress = Math.min(100, (remainingTime / totalTime) * 100);

  // Determine color based on remaining time
  const getColor = () => {
    if (remainingTime <= 60) return 'text-red-500';
    if (remainingTime <= 180) return 'text-yellow-500';
    return 'text-orange-400';
  };

  const getBgColor = () => {
    if (remainingTime <= 60) return 'bg-red-500';
    if (remainingTime <= 180) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  if (isExpired) {
    return (
      <motion.div
        className={`flex items-center gap-2 text-red-500 ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium">Время истекло</span>
      </motion.div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Clock className={`w-4 h-4 ${getColor()}`} />
        <span className={`font-mono text-lg font-semibold ${getColor()}`}>
          {formatTime(remainingTime)}
        </span>
        <span className="text-gray-400 text-sm">осталось</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getBgColor()} rounded-full`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
