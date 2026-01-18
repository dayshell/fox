'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '@/hooks/useCoins';
import { usePayments } from '@/hooks/usePayments';
import { useOrders } from '@/hooks/useOrders';
import { useLanguage } from '@/context/LanguageContext';
import { useFoxPaysGateways, filterGatewaysByAmount } from '@/hooks/useFoxPaysGateways';
import { useFoxPaysOrder } from '@/hooks/useFoxPaysOrder';
import { Coin, Order } from '@/types';
import { ExchangeOrder } from '@/types/foxpays';
import { PaymentGatewaySelector } from '@/components/PaymentGatewaySelector';
import { CopyButton } from '@/components/CopyButton';
import { PaymentTimer } from '@/components/PaymentTimer';
import { Copy, CheckCircle, Clock, ArrowRight, AlertCircle, MessageSquare, HelpCircle, X, CreditCard, Smartphone, QrCode, Building2, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';

function ExchangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { coins, loading: coinsLoading } = useCoins();
  const { payments, loading: paymentsLoading } = usePayments();
  const { orders, createOrder } = useOrders();
  const { t } = useLanguage();
  
  // FoxPays hooks
  const { gateways, loading: gatewaysLoading, isConfigured: foxpaysConfigured } = useFoxPaysGateways();
  const { createOrder: createFoxPaysOrder, confirmPayment, cancelOrder, loading: foxpaysLoading, error: foxpaysError } = useFoxPaysOrder();
  
  const [fromCoin, setFromCoin] = useState<Coin | null>(null);
  const [toCoin, setToCoin] = useState<Coin | null>(null);
  const [amount, setAmount] = useState('0');
  const [receiveAmount, setReceiveAmount] = useState('0');
  const [walletAddress, setWalletAddress] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(1);
  const [orderNumber, setOrderNumber] = useState('');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  
  // FoxPays state
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
  const [foxpaysOrder, setFoxpaysOrder] = useState<ExchangeOrder | null>(null);
  const [useFoxPays, setUseFoxPays] = useState(false);


  // Calculate current help step based on exchange progress
  const getCurrentHelpStep = () => {
    if (currentOrder?.status === 'completed' || foxpaysOrder?.status === 'success') return 3;
    if (step === 2) return 3;
    return 2;
  };

  const helpSteps = [
    { title: t('exchange.helpStep1Title'), desc: t('exchange.helpStep1Desc') },
    { title: t('exchange.helpStep2Title'), desc: t('exchange.helpStep2Desc') },
    { title: t('exchange.helpStep3Title'), desc: t('exchange.helpStep3Desc') },
    { title: t('exchange.helpStep4Title'), desc: t('exchange.helpStep4Desc') },
  ];

  // Generate or restore order number
  useEffect(() => {
    const existingOrder = searchParams.get('order');
    if (existingOrder) {
      setOrderNumber(existingOrder);
    } else {
      setOrderNumber('FX' + Math.random().toString(36).substring(2, 8).toUpperCase());
    }
  }, [searchParams]);

  // Check for existing order and restore data
  useEffect(() => {
    if (orderNumber && orderNumber.startsWith('FX') && orders.length > 0 && coins.length > 0) {
      const order = orders.find(o => o.orderNumber === orderNumber);
      if (order) {
        setCurrentOrder(order);
        setStep(2);
        const from = coins.find(c => c.id === order.fromCoinId);
        const to = coins.find(c => c.id === order.toCoinId);
        if (from) setFromCoin(from);
        if (to) setToCoin(to);
        setAmount(order.amount.toString());
        setReceiveAmount(order.receiveAmount.toString());
        setWalletAddress(order.customerWallet);
      }
    }
  }, [orderNumber, orders, coins]);

  // Check for FoxPays order in localStorage
  useEffect(() => {
    const foxpaysOrderId = searchParams.get('foxpays');
    if (foxpaysOrderId) {
      try {
        const savedOrders = JSON.parse(localStorage.getItem('foxpaysOrders') || '[]');
        const order = savedOrders.find((o: ExchangeOrder) => o.foxpaysOrderId === foxpaysOrderId);
        if (order) {
          setFoxpaysOrder(order);
          setUseFoxPays(true);
          setStep(2);
        }
      } catch (e) {
        console.error('Failed to load FoxPays order');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (currentOrder || foxpaysOrder) return;
    
    const fromId = searchParams.get('from');
    const toId = searchParams.get('to');
    const amt = searchParams.get('amount') || '0';

    if (coins.length > 0) {
      const from = coins.find(c => c.id === fromId);
      const to = coins.find(c => c.id === toId);
      
      if (from && to) {
        setFromCoin(from);
        setToCoin(to);
        setAmount(amt);
        const rate = from.sellRate / to.buyRate;
        setReceiveAmount((parseFloat(amt) * rate).toFixed(8));
        
        // Check if FoxPays should be used for fiat payments
        const isFromFiat = !from.logoUrl;
        // ALWAYS use FoxPays if it's configured and we're dealing with fiat
        if (isFromFiat && foxpaysConfigured) {
          setUseFoxPays(true);
        }
      }
      setIsInitialized(true);
    }
  }, [searchParams, coins, currentOrder, foxpaysOrder, foxpaysConfigured, gateways]);

  const isFiat = (coin: Coin | null) => coin && !coin.logoUrl;

  const paymentWallet = payments.find(p => 
    p.type === 'crypto' && p.coinId === fromCoin?.id && p.isActive && p.walletAddress
  );
  
  const bankPayment = payments.find(p => 
    p.type === 'bank' && p.isActive && p.accountNumber
  );

  const isFromCoinFiat = fromCoin ? !fromCoin.logoUrl : false;
  const hasPaymentMethod = isFromCoinFiat ? (useFoxPays ? selectedGateway !== null : !!bankPayment) : !!paymentWallet;


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const handleConfirmPayment = async () => {
    if (!walletAddress) {
      alert(t('exchange.enterWalletAlert'));
      return;
    }
    
    if (isFiat(toCoin) && !cardholderName) {
      alert(t('exchange.enterCardholderName'));
      return;
    }
    
    if (!fromCoin || !toCoin) return;

    // If using FoxPays, create order through FoxPays API
    if (useFoxPays && selectedGateway) {
      const foxOrder = await createFoxPaysOrder({
        amount: parseFloat(amount),
        currency: 'RUB',
        payment_gateway: selectedGateway,
        coinId: toCoin.id,
        coinSymbol: toCoin.symbol,
        coinAmount: parseFloat(receiveAmount),
        userContact: isFiat(toCoin) ? `${walletAddress} | ${cardholderName}` : walletAddress,
      });

      if (foxOrder) {
        // Save to localStorage
        const savedOrders = JSON.parse(localStorage.getItem('foxpaysOrders') || '[]');
        savedOrders.push(foxOrder);
        localStorage.setItem('foxpaysOrders', JSON.stringify(savedOrders));
        
        // Redirect to order page to show payment details
        router.push(`/order/${foxOrder.foxpaysOrderId}`);
        
        // Send Telegram notification
        sendTelegramNotification(foxOrder);
      }
      return;
    }

    // Original flow for non-FoxPays payments
    const rate = fromCoin.sellRate / toCoin.buyRate;
    const paymentMethod = toCoin.id === 'rub-sbp' ? 'СБП' : toCoin.id === 'rub-card' ? 'Карта' : '';
    const customerInfo = isFiat(toCoin) 
      ? `${paymentMethod ? `[${paymentMethod}] ` : ''}${walletAddress} | ${cardholderName}` 
      : walletAddress;
    
    const order = createOrder({
      orderNumber,
      fromCoinId: fromCoin.id,
      fromCoinSymbol: fromCoin.symbol,
      fromCoinName: fromCoin.name,
      toCoinId: toCoin.id,
      toCoinSymbol: toCoin.symbol,
      toCoinName: toCoin.name,
      amount: parseFloat(amount),
      receiveAmount: parseFloat(receiveAmount),
      rate,
      customerWallet: customerInfo,
      status: 'paid',
    });
    
    sendTelegramNotificationLegacy(order, rate, customerInfo);
    
    setCurrentOrder(order);
    setStep(2);
    router.replace(`/exchange?order=${orderNumber}`);
  };

  const sendTelegramNotification = (order: ExchangeOrder) => {
    try {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
          const telegramMessage = `🦊 <b>Новый заказ FoxPays</b>\n\n` +
            `💱 <b>Сумма:</b> ${formatAmount(order.amount)} ${order.currency}\n` +
            `🏦 <b>Метод:</b> ${order.paymentGatewayName}\n` +
            `💰 <b>Получит:</b> ${order.coinAmount} ${order.coinSymbol}\n` +
            `👛 <b>Контакт:</b> <code>${order.userContact}</code>\n\n` +
            `⏰ ${new Date().toLocaleString('ru-RU')}`;
          
          const chatIds = settings.telegramChatId.split(',').map((id: string) => id.trim()).filter((id: string) => id);
          chatIds.forEach((chatId: string) => {
            fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: 'HTML',
              }),
            }).catch(err => console.log('Telegram error:', err));
          });
        }
      }
    } catch (e) {
      console.log('Telegram notification error:', e);
    }
  };

  const sendTelegramNotificationLegacy = (order: Order, rate: number, customerInfo: string) => {
    try {
      const savedSettings = localStorage.getItem('siteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.telegramEnabled && settings.telegramBotToken && settings.telegramChatId) {
          const telegramMessage = `🦊 <b>Новый заказ #${orderNumber}</b>\n\n` +
            `💱 <b>Обмен:</b> ${amount} ${fromCoin?.symbol} → ${receiveAmount} ${toCoin?.symbol}\n` +
            `💰 <b>Курс:</b> 1 ${fromCoin?.symbol} = ${rate.toFixed(8)} ${toCoin?.symbol}\n` +
            `👛 <b>Кошелёк:</b> <code>${customerInfo}</code>\n\n` +
            `⏰ ${new Date().toLocaleString('ru-RU')}`;
          
          const chatIds = settings.telegramChatId.split(',').map((id: string) => id.trim()).filter((id: string) => id);
          chatIds.forEach((chatId: string) => {
            fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: telegramMessage,
                parse_mode: 'HTML',
              }),
            }).catch(err => console.log('Telegram error:', err));
          });
        }
      }
    } catch (e) {
      console.log('Telegram notification error:', e);
    }
  };

  const handleFoxPaysConfirm = async () => {
    if (foxpaysOrder) {
      const success = await confirmPayment(foxpaysOrder.foxpaysOrderId);
      if (success) {
        window.location.reload();
      }
    }
  };

  const handleFoxPaysCancel = async () => {
    if (foxpaysOrder && confirm(t('foxpays.confirmCancel'))) {
      const success = await cancelOrder(foxpaysOrder.foxpaysOrderId);
      if (success) {
        router.push('/');
      }
    }
  };

  // Refresh order status periodically
  useEffect(() => {
    if (step === 2 && orderNumber && orders.length > 0 && !useFoxPays) {
      const interval = setInterval(() => {
        const order = orders.find(o => o.orderNumber === orderNumber);
        if (order) {
          setCurrentOrder(order);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [step, orderNumber, orders, useFoxPays]);


  // Show loading while coins or payments are loading
  if (coinsLoading || paymentsLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!fromCoin || !toCoin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl text-white mb-2">{t('exchange.error')}</h2>
          <p className="text-gray-400 mb-4">{t('exchange.loadError')}</p>
          <Link href="/" className="text-orange-400 hover:text-orange-300">
            {t('exchange.backHome')}
          </Link>
        </div>
      </div>
    );
  }

  // Available FoxPays gateways for current amount
  const availableGateways = filterGatewaysByAmount(gateways, parseFloat(amount));
  const showFoxPaysSelector = isFromCoinFiat && foxpaysConfigured && availableGateways.length > 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 relative">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-orange-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-orange-600' : 'bg-gray-800'}`}>
              1
            </div>
            <span className="hidden sm:inline">{t('exchange.step1')}</span>
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-orange-600' : 'bg-gray-800'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-orange-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-orange-600' : 'bg-gray-800'}`}>
              2
            </div>
            <span className="hidden sm:inline">{t('exchange.step2')}</span>
          </div>
          <div className={`w-12 h-0.5 ${(currentOrder?.status === 'completed' || foxpaysOrder?.status === 'success') ? 'bg-orange-600' : 'bg-gray-800'}`} />
          <div className={`flex items-center gap-2 ${(currentOrder?.status === 'completed' || foxpaysOrder?.status === 'success') ? 'text-orange-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(currentOrder?.status === 'completed' || foxpaysOrder?.status === 'success') ? 'bg-orange-600' : 'bg-gray-800'}`}>
              3
            </div>
            <span className="hidden sm:inline">{t('exchange.step3')}</span>
          </div>
        </div>

        {/* Order Info */}
        <motion.div
          className="card-dark p-6 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400">
              {foxpaysOrder ? `${t('exchange.order')} #${foxpaysOrder.foxpaysOrderId.slice(0, 8)}...` : `${t('exchange.order')} #${orderNumber}`}
            </span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-yellow-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {foxpaysOrder?.status === 'success' ? t('foxpays.statusSuccess') :
                   foxpaysOrder?.status === 'fail' ? t('foxpays.statusFailed') :
                   currentOrder?.status === 'completed' ? t('exchange.statusCompleted') : 
                   currentOrder?.status === 'processing' ? t('exchange.statusProcessing') :
                   currentOrder?.status === 'paid' ? t('exchange.statusPaid') :
                   t('exchange.waitingPayment')}
                </span>
              </div>
              <button
                onClick={() => setShowHelp(true)}
                className="w-7 h-7 rounded-full border border-gray-600 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-400 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-dark-input rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {fromCoin?.logoUrl ? (
                  <Image src={fromCoin.logoUrl} alt={fromCoin.name} width={40} height={40} />
                ) : (
                  <span className="font-bold text-orange-400">{fromCoin?.symbol?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{amount} {fromCoin?.symbol || ''}</p>
                <p className="text-gray-500 text-sm">{t('exchange.youSend')}</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-orange-500" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {toCoin?.logoUrl ? (
                  <Image src={toCoin.logoUrl} alt={toCoin.name} width={40} height={40} />
                ) : (
                  <span className="font-bold text-orange-400">{toCoin?.symbol?.charAt(0) || '?'}</span>
                )}
              </div>
              <div>
                <p className="text-white font-semibold">{receiveAmount} {toCoin?.symbol || ''}</p>
                <p className="text-gray-500 text-sm">{t('exchange.youReceive')}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Message */}
        {currentOrder?.adminMessage && (
          <motion.div
            className="card-dark p-6 mb-6 border-orange-500/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-start gap-3">
              <MessageSquare className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-orange-400 font-semibold mb-1">{t('exchange.operatorMessage')}</p>
                <p className="text-white">{currentOrder.adminMessage}</p>
              </div>
            </div>
          </motion.div>
        )}


        {step === 1 && (
          <>
            {/* FoxPays Payment Gateway Selector */}
            {showFoxPaysSelector && (
              <motion.div
                className="card-dark p-6 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
              >
                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('foxpays.selectPaymentMethod')}
                </h3>
                <PaymentGatewaySelector
                  gateways={gateways}
                  selectedGateway={selectedGateway}
                  onSelect={setSelectedGateway}
                  amount={parseFloat(amount)}
                  loading={gatewaysLoading}
                />
              </motion.div>
            )}

            {/* Payment Details - Crypto or Bank (fallback if FoxPays not available) */}
            {!showFoxPaysSelector && (
              <motion.div
                className="card-dark p-6 mb-6 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{ minHeight: showHelp ? '380px' : 'auto' }}
              >
                {/* Help Bottom Sheet */}
                <AnimatePresence>
                  {showHelp && (
                    <motion.div
                      className="absolute left-0 right-0 bottom-0 bg-dark-card rounded-2xl z-20 p-5"
                      initial={{ y: '100%', opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: '100%', opacity: 0 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    >
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />
                      <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-orange-500 rounded-tr-2xl rounded-br-2xl" />
                      
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <h3 className="text-white font-semibold">{t('exchange.helpTitle')}</h3>
                        <button
                          onClick={() => setShowHelp(false)}
                          className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {helpSteps.map((helpStep, index) => {
                          const currentStep = getCurrentHelpStep();
                          const isActive = index === currentStep;
                          const isCompleted = index < currentStep;
                          
                          return (
                            <div key={index} className="flex gap-3">
                              <div className="flex flex-col items-center">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                  isActive ? 'border-orange-500 bg-orange-500' : 
                                  isCompleted ? 'border-orange-500 bg-orange-500' : 
                                  'border-gray-600 bg-transparent'
                                }`}>
                                  {(isActive || isCompleted) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                                {index < helpSteps.length - 1 && (
                                  <div className={`w-0.5 flex-1 mt-1 transition-colors ${
                                    isCompleted ? 'bg-orange-500' : 'bg-gray-700'
                                  }`} />
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <h4 className={`text-sm font-medium mb-0.5 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                                  {helpStep.title}
                                </h4>
                                <p className="text-gray-400 text-xs leading-relaxed">{helpStep.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <h3 className="text-lg font-semibold text-white mb-4">
                  {t('exchange.sendTo', { amount, symbol: fromCoin?.symbol || '' })}
                </h3>

                {/* Crypto payment */}
                {!isFiat(fromCoin) && paymentWallet ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-xl">
                        <QRCodeSVG 
                          value={paymentWallet.walletAddress || ''} 
                          size={180}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    </div>
                    <p className="text-center text-gray-400 text-sm">{t('exchange.scanQR')}</p>
                    
                    <div className="p-4 bg-dark-input rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-sm">{t('exchange.network')}: {paymentWallet.network}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-white text-sm break-all font-mono bg-dark-bg p-3 rounded-lg">
                          {paymentWallet.walletAddress}
                        </code>
                        <motion.button
                          onClick={() => handleCopy(paymentWallet.walletAddress || '')}
                          className="p-3 rounded-lg bg-orange-600 text-white"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-yellow-500 text-sm">
                        {t('exchange.warning', { symbol: fromCoin?.symbol || '', network: paymentWallet.network || '' })}
                      </p>
                    </div>
                  </div>
                ) : isFiat(fromCoin) && bankPayment ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-dark-input rounded-xl space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{t('exchange.bank')}:</span>
                        <span className="text-white font-medium">{bankPayment.bankName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{t('exchange.cardNumber')}:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-white font-mono">{bankPayment.accountNumber}</code>
                          <motion.button
                            onClick={() => handleCopy(bankPayment.accountNumber || '')}
                            className="p-2 rounded-lg bg-orange-600 text-white"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </motion.button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">{t('exchange.recipient')}:</span>
                        <span className="text-white">{bankPayment.holderName}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-yellow-500 text-sm">
                        {t('exchange.bankWarning', { amount, symbol: fromCoin?.symbol || '' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400">
                      {t('exchange.walletNotConfigured', { symbol: fromCoin?.symbol || '' })}
                    </p>
                  </div>
                )}
              </motion.div>
            )}


            {/* Receive Wallet/Card Input */}
            <motion.div
              className="card-dark p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {isFiat(toCoin) 
                  ? t('exchange.yourDetails', { symbol: toCoin?.symbol || '' })
                  : t('exchange.yourWallet', { symbol: toCoin?.symbol || '' })
                }
              </h3>
              
              {isFiat(toCoin) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">
                      {toCoin?.id === 'rub-sbp' ? t('exchange.phoneNumber') : t('exchange.cardNumber')}
                    </label>
                    <input
                      type="text"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder={toCoin?.id === 'rub-sbp' ? '+7 (999) 123-45-67' : '0000 0000 0000 0000'}
                      className="w-full px-4 py-3 input-dark font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">{t('exchange.cardholderName')}</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className="w-full px-4 py-3 input-dark text-sm"
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={t('exchange.enterWallet', { symbol: toCoin?.symbol || '' })}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                />
              )}
              
              {toCoin?.id === 'rub-sbp' && (
                <p className="text-gray-500 text-sm mt-3">
                  {t('exchange.sbpHint')}
                </p>
              )}
            </motion.div>

            {/* FoxPays Error */}
            {foxpaysError && (
              <motion.div
                className="card-dark p-4 mb-6 border border-red-500/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-red-400 text-sm">{foxpaysError}</p>
              </motion.div>
            )}

            {/* Confirm Button */}
            {(hasPaymentMethod || (showFoxPaysSelector && selectedGateway)) ? (
              <motion.button
                onClick={handleConfirmPayment}
                disabled={foxpaysLoading}
                className="w-full py-4 text-lg font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: foxpaysLoading ? 1 : 1.02 }}
                whileTap={{ scale: foxpaysLoading ? 1 : 0.98 }}
              >
                {foxpaysLoading ? t('foxpays.creatingOrder') : 
                 showFoxPaysSelector ? t('foxpays.createOrder') : t('exchange.iPaid')}
              </motion.button>
            ) : (
              <button
                disabled
                className="w-full py-4 text-lg font-semibold rounded-xl bg-gray-700 text-gray-400 cursor-not-allowed"
              >
                {showFoxPaysSelector ? t('foxpays.selectPaymentMethod') : t('exchange.iPaid')}
              </button>
            )}
          </>
        )}


        {/* Step 2 - FoxPays Payment Details */}
        {step === 2 && useFoxPays && foxpaysOrder && (
          <motion.div
            className="card-dark p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {foxpaysOrder.status === 'success' ? (
              <div className="text-center py-8">
                <motion.div 
                  className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-12 h-12 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('foxpays.paymentSuccess')}</h2>
                <p className="text-gray-400 mb-6">{t('foxpays.paymentSuccessDesc')}</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors"
                >
                  {t('exchange.backHome')}
                </Link>
              </div>
            ) : foxpaysOrder.status === 'fail' ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 rounded-full bg-red-600/20 flex items-center justify-center mx-auto mb-6">
                  <X className="w-12 h-12 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{t('foxpays.paymentFailed')}</h2>
                <p className="text-gray-400 mb-6">{t('foxpays.paymentFailedDesc')}</p>
                <Link
                  href="/"
                  className="inline-block px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors"
                >
                  {t('foxpays.tryAgain')}
                </Link>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">{t('foxpays.paymentDetails')}</h3>
                
                {/* Amount to pay */}
                <div className="mb-6">
                  <div className="text-gray-400 text-sm mb-2">{t('foxpays.amountToPay')}</div>
                  <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <span className="text-2xl font-bold text-orange-400">
                      {formatAmount(foxpaysOrder.amount)} {foxpaysOrder.currency?.toUpperCase() || 'RUB'}
                    </span>
                    <CopyButton text={foxpaysOrder.amount?.toString() || ''} size="sm" />
                  </div>
                </div>

                {/* Payment detail based on type */}
                {foxpaysOrder.paymentDetail?.detailType === 'card' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <CreditCard className="w-4 h-4" />
                      <span>{t('foxpays.cardNumber')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                      <code className="flex-1 text-white text-lg font-mono tracking-wider">
                        {formatCardNumber(foxpaysOrder.paymentDetail.detail)}
                      </code>
                      <CopyButton text={foxpaysOrder.paymentDetail.detail} size="md" />
                    </div>
                  </div>
                )}

                {foxpaysOrder.paymentDetail?.detailType === 'phone' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Smartphone className="w-4 h-4" />
                      <span>{t('foxpays.phoneNumber')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                      <code className="flex-1 text-white text-lg font-mono">
                        {foxpaysOrder.paymentDetail.detail}
                      </code>
                      <CopyButton text={foxpaysOrder.paymentDetail.detail} size="md" />
                    </div>
                  </div>
                )}

                {foxpaysOrder.paymentDetail?.detailType === 'qrcode' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <QrCode className="w-4 h-4" />
                      <span>{t('foxpays.qrCode')}</span>
                    </div>
                    <div className="flex justify-center">
                      <div className="p-4 bg-white rounded-xl">
                        {foxpaysOrder.paymentDetail.qrCodeUrl ? (
                          <Image
                            src={foxpaysOrder.paymentDetail.qrCodeUrl}
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
                    <p className="text-center text-gray-400 text-sm">{t('foxpays.scanQrCode')}</p>
                  </div>
                )}

                {foxpaysOrder.paymentDetail?.detailType === 'account_number' && (
                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Building2 className="w-4 h-4" />
                      <span>{t('foxpays.accountNumber')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-dark-input rounded-xl">
                      <code className="flex-1 text-white text-lg font-mono">
                        {foxpaysOrder.paymentDetail.detail}
                      </code>
                      <CopyButton text={foxpaysOrder.paymentDetail.detail} size="md" />
                    </div>
                  </div>
                )}

                {/* Recipient */}
                {foxpaysOrder.paymentDetail?.initials && (
                  <div className="mb-6 p-4 bg-dark-input rounded-xl">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{t('foxpays.recipient')}:</span>
                      <span className="text-white font-medium">{foxpaysOrder.paymentDetail.initials}</span>
                    </div>
                  </div>
                )}

                {/* Timer */}
                {foxpaysOrder.expiresAt && (
                  <div className="mb-6">
                    <PaymentTimer
                      expiresAt={foxpaysOrder.expiresAt}
                      onExpire={() => window.location.reload()}
                    />
                  </div>
                )}

                {/* Warning */}
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-yellow-500 text-sm">
                    ⚠️ {t('foxpays.exactAmountWarning', { amount: formatAmount(foxpaysOrder.amount), currency: foxpaysOrder.currency?.toUpperCase() || 'RUB' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={handleFoxPaysConfirm}
                    disabled={foxpaysLoading}
                    className="flex-1 py-4 text-lg font-semibold rounded-xl bg-orange-600 hover:bg-orange-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: foxpaysLoading ? 1 : 1.02 }}
                    whileTap={{ scale: foxpaysLoading ? 1 : 0.98 }}
                  >
                    {foxpaysLoading ? t('foxpays.confirming') : t('foxpays.iPaid')}
                  </motion.button>
                  <motion.button
                    onClick={handleFoxPaysCancel}
                    disabled={foxpaysLoading}
                    className="px-6 py-4 rounded-xl border border-gray-600 text-gray-400 hover:text-white hover:border-gray-500 disabled:opacity-50"
                    whileHover={{ scale: foxpaysLoading ? 1 : 1.02 }}
                    whileTap={{ scale: foxpaysLoading ? 1 : 0.98 }}
                  >
                    {t('foxpays.cancel')}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        )}


        {/* Step 2 - Legacy Order Status (non-FoxPays) */}
        {step === 2 && !useFoxPays && (
          <motion.div
            className="card-dark p-8 text-center relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ minHeight: showHelp ? '380px' : 'auto' }}
          >
            {/* Help Bottom Sheet */}
            <AnimatePresence>
              {showHelp && (
                <motion.div
                  className="absolute left-0 right-0 bottom-0 bg-dark-card rounded-2xl z-20 p-5 text-left"
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: '100%', opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-600 rounded-full" />
                  <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-orange-500 rounded-tr-2xl rounded-br-2xl" />
                  
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className="text-white font-semibold">{t('exchange.helpTitle')}</h3>
                    <button
                      onClick={() => setShowHelp(false)}
                      className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:bg-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {helpSteps.map((helpStep, index) => {
                      const currentStep = getCurrentHelpStep();
                      const isActive = index === currentStep;
                      const isCompleted = index < currentStep;
                      
                      return (
                        <div key={index} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isActive ? 'border-orange-500 bg-orange-500' : 
                              isCompleted ? 'border-orange-500 bg-orange-500' : 
                              'border-gray-600 bg-transparent'
                            }`}>
                              {(isActive || isCompleted) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            {index < helpSteps.length - 1 && (
                              <div className={`w-0.5 flex-1 mt-1 transition-colors ${
                                isCompleted ? 'bg-orange-500' : 'bg-gray-700'
                              }`} />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <h4 className={`text-sm font-medium mb-0.5 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                              {helpStep.title}
                            </h4>
                            <p className="text-gray-400 text-xs leading-relaxed">{helpStep.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {currentOrder?.status === 'completed' ? (
              <>
                <motion.div 
                  className="w-24 h-24 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {t('exchange.exchangeComplete')}
                </motion.h2>
                <motion.p 
                  className="text-gray-400 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {t('exchange.fundsSent')}
                </motion.p>
              </>
            ) : (
              <>
                {/* Animated Processing Indicator */}
                <div className="relative w-32 h-32 mx-auto mb-8">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-orange-500/20"
                    style={{ borderTopColor: 'rgb(249 115 22)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-2 rounded-full border-2 border-orange-400/30"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    className="absolute inset-4 rounded-full border-2 border-orange-500/30"
                    style={{ borderBottomColor: 'rgb(251 146 60)' }}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Clock className="w-10 h-10 text-orange-400" />
                    </motion.div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 mb-6">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-orange-500"
                      animate={{ 
                        y: [0, -8, 0],
                        opacity: [0.4, 1, 0.4]
                      }}
                      transition={{ 
                        duration: 0.8, 
                        repeat: Infinity, 
                        delay: i * 0.15,
                        ease: "easeInOut"
                      }}
                    />
                  ))}
                </div>

                <motion.h2 
                  className="text-2xl font-bold text-white mb-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  {t('exchange.processing')}
                </motion.h2>
                <p className="text-gray-400 mb-6">
                  {t('exchange.processingDesc')}
                </p>

                <motion.div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div 
                    className="w-2 h-2 rounded-full bg-orange-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="text-orange-400 text-sm">{t('exchange.checkingTransaction')}</span>
                </motion.div>
              </>
            )}
            <div className="p-4 bg-dark-input rounded-xl mb-6">
              <p className="text-gray-400 text-sm mb-1">{t('exchange.yourReceiveWallet')}</p>
              <code className="text-white font-mono text-sm break-all">
                {currentOrder?.customerWallet || walletAddress}
              </code>
            </div>
            <p className="text-gray-500 text-sm">
              {t('exchange.orderNumber')}: <span className="text-white">{orderNumber}</span>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ExchangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ExchangeContent />
    </Suspense>
  );
}
