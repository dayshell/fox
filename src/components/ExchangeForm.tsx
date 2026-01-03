'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCoins } from '@/hooks/useCoins';
import { useLanguage } from '@/context/LanguageContext';
import { Coin } from '@/types';
import { ChevronDown, Search, ArrowLeftRight, HelpCircle, X } from 'lucide-react';
import Image from 'next/image';

const fiatIcons: Record<string, string> = {
  'RUB': '₽',
  'USD': '$',
  'CNY': '¥',
  'UZS': 'сум',
  'EUR': '€',
};

function getCurrencyIcon(symbol: string, logoUrl: string) {
  if (logoUrl) return null;
  return fiatIcons[symbol] || symbol.charAt(0);
}

interface CoinSelectorProps {
  label: string;
  selectedCoin: Coin | null;
  coins: Coin[];
  onSelect: (coin: Coin) => void;
  excludeCoin?: Coin | null;
}

function CoinSelector({ label, selectedCoin, coins, onSelect, excludeCoin }: CoinSelectorProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCoins = coins.filter(c => 
    c.id !== excludeCoin?.id &&
    (c.name.toLowerCase().includes(search.toLowerCase()) || 
     c.symbol.toLowerCase().includes(search.toLowerCase()) ||
     (c.network && c.network.toLowerCase().includes(search.toLowerCase())))
  );

  const cryptoCoins = filteredCoins.filter(c => c.logoUrl);
  const fiatCoins = filteredCoins.filter(c => !c.logoUrl);

  return (
    <div className="relative">
      <label className="block text-gray-400 text-xs mb-1.5">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-dark-input border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
      >
        {selectedCoin ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {selectedCoin.logoUrl ? (
                <Image src={selectedCoin.logoUrl} alt={selectedCoin.name} width={24} height={24} />
              ) : (
                <span className="text-xs font-bold text-orange-400">{getCurrencyIcon(selectedCoin.symbol, selectedCoin.logoUrl)}</span>
              )}
            </div>
            <div className="flex flex-col items-start">
              <span className="text-white text-sm leading-tight">{selectedCoin.symbol}</span>
              {selectedCoin.network && (
                <span className="text-gray-500 text-[10px] leading-tight">{selectedCoin.network}</span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-gray-500 text-sm">{t('exchange.selectCurrency')}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              className="absolute left-0 right-0 mt-1 bg-dark-card border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden bottom-full mb-1"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="p-2 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('exchange.search')}
                    className="w-full pl-7 pr-3 py-1.5 bg-dark-input border border-gray-700 rounded text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {cryptoCoins.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] text-gray-500 bg-dark-bg/50">{t('exchange.crypto')}</div>
                    {cryptoCoins.map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => { onSelect(coin); setIsOpen(false); setSearch(''); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-500/10 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          <Image src={coin.logoUrl} alt={coin.name} width={20} height={20} />
                        </div>
                        <div className="flex-1 text-left">
                          <span className="text-white text-xs">{coin.symbol}</span>
                          {coin.network && (
                            <span className="text-gray-500 text-[10px] ml-1">({coin.network})</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                )}
                {fiatCoins.length > 0 && (
                  <>
                    <div className="px-3 py-1 text-[10px] text-gray-500 bg-dark-bg/50">{t('exchange.fiat')}</div>
                    {fiatCoins.map((coin) => (
                      <button
                        key={coin.id}
                        onClick={() => { onSelect(coin); setIsOpen(false); setSearch(''); }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-orange-500/10 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{getCurrencyIcon(coin.symbol, coin.logoUrl)}</span>
                        </div>
                        <span className="text-white text-xs">{coin.name}</span>
                        <span className="text-gray-500 text-[10px]">{coin.symbol}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ExchangeForm() {
  const router = useRouter();
  const { activeCoins, loading } = useCoins();
  const { t } = useLanguage();
  const [fromCoin, setFromCoin] = useState<Coin | null>(null);
  const [toCoin, setToCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const helpSteps = [
    { title: t('exchange.helpStep1Title'), desc: t('exchange.helpStep1Desc') },
    { title: t('exchange.helpStep2Title'), desc: t('exchange.helpStep2Desc') },
    { title: t('exchange.helpStep3Title'), desc: t('exchange.helpStep3Desc') },
    { title: t('exchange.helpStep4Title'), desc: t('exchange.helpStep4Desc') },
  ];

  useEffect(() => {
    if (activeCoins.length >= 2 && !fromCoin && !toCoin) {
      setFromCoin(activeCoins[0]);
      setToCoin(activeCoins[1]);
    }
  }, [activeCoins, fromCoin, toCoin]);

  const calculateReceive = () => {
    if (!fromCoin || !toCoin || !amount) return '0';
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return '0';
    const rate = fromCoin.sellRate / toCoin.buyRate;
    return (amountNum * rate).toFixed(8);
  };

  const handleSwap = () => {
    const temp = fromCoin;
    setFromCoin(toCoin);
    setToCoin(temp);
  };

  const handleExchange = () => {
    if (!fromCoin || !toCoin || !amount) return;
    const params = new URLSearchParams({
      from: fromCoin.id,
      to: toCoin.id,
      amount: amount,
    });
    router.push(`/exchange?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="card-dark p-5 animate-pulse max-w-lg mx-auto">
        <div className="h-32 bg-gray-800 rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      className="card-dark p-6 max-w-xl mx-auto relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ overflow: 'visible' }}
    >
      {/* Help Bottom Sheet - inside card */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            className="absolute inset-0 bg-dark-card rounded-2xl z-20 p-5 overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Handle bar */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />
            
            <div className="flex items-center justify-between mb-5 mt-2">
              <h3 className="text-white font-semibold">{t('exchange.helpTitle')}</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              {helpSteps.map((step, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${index === 0 ? 'border-orange-500 bg-orange-500' : 'border-gray-600'}`}>
                      {index === 0 && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    {index < helpSteps.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-700 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <h4 className="text-white text-sm font-medium mb-0.5">{step.title}</h4>
                    <p className="text-gray-400 text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title with help button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">{t('exchange.selectPair')}</h2>
        <button
          onClick={() => setShowHelp(true)}
          className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-[1fr_32px_1fr] gap-2 mb-3">
        <h3 className="text-white font-medium text-sm">{t('exchange.youSend')}</h3>
        <div />
        <h3 className="text-white font-medium text-sm">{t('exchange.youReceive')}</h3>
      </div>

      {/* Currency selectors with swap button */}
      <div className="grid grid-cols-[1fr_32px_1fr] gap-2 items-end mb-3">
        <CoinSelector
          label={t('exchange.currency')}
          selectedCoin={fromCoin}
          coins={activeCoins}
          onSelect={setFromCoin}
          excludeCoin={toCoin}
        />
        
        {/* Swap Button */}
        <div className="flex justify-center pb-1">
          <motion.button
            onClick={handleSwap}
            className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeftRight className="w-4 h-4" />
          </motion.button>
        </div>

        <CoinSelector
          label={t('exchange.currency')}
          selectedCoin={toCoin}
          coins={activeCoins}
          onSelect={setToCoin}
          excludeCoin={fromCoin}
        />
      </div>

      {/* Amount inputs */}
      <div className="grid grid-cols-[1fr_32px_1fr] gap-2">
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">{t('exchange.amount')}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 input-dark text-sm"
          />
        </div>
        <div />
        <div>
          <label className="block text-gray-400 text-xs mb-1.5">{t('exchange.youGet')}</label>
          <div className="px-3 py-2.5 bg-dark-input border border-gray-700 rounded-lg">
            <span className="text-white text-sm font-medium">{calculateReceive()}</span>
            <span className="text-gray-500 text-xs ml-1">{toCoin?.symbol}</span>
          </div>
        </div>
      </div>

      {/* Rate Info */}
      {fromCoin && toCoin && (
        <div className="mt-4 p-3 bg-dark-input rounded-lg flex items-center justify-between">
          <span className="text-gray-400 text-xs">{t('exchange.rate')}:</span>
          <span className="text-white text-xs">
            1 {fromCoin.symbol} = {(fromCoin.sellRate / toCoin.buyRate).toFixed(8)} {toCoin.symbol}
          </span>
        </div>
      )}

      {/* Exchange Button */}
      <motion.button
        onClick={handleExchange}
        disabled={!fromCoin || !toCoin || !amount || parseFloat(amount) <= 0}
        className="w-full mt-4 py-3 btn-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {t('exchange.continue')}
      </motion.button>
    </motion.div>
  );
}
