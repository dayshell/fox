'use client';

import { motion } from 'framer-motion';
import { Coin } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';

interface CoinCardProps {
  coin: Coin;
  index: number;
}

export default function CoinCard({ coin, index }: CoinCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      className="card-dark p-5 hover:border-orange-500/50 transition-all cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
          {coin.logoUrl ? (
            <Image
              src={coin.logoUrl}
              alt={coin.name}
              width={48}
              height={48}
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-orange-400">
              {coin.symbol.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
              {coin.name}
            </h3>
            <span className="text-gray-500 text-sm">{coin.symbol}</span>
          </div>
          
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500 text-sm">${coin.buyRate.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-red-500 text-sm">${coin.sellRate.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
