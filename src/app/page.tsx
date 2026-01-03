'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useCoins } from '@/hooks/useCoins';
import ExchangeForm from '@/components/ExchangeForm';
import CoinCard from '@/components/CoinCard';
import { Shield, Zap, ThumbsUp, BadgeCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { t } = useLanguage();
  const { coins, loading } = useCoins();

  const features = [
    { icon: Zap, title: t('home.features.profitable'), desc: t('home.features.profitableDesc') },
    { icon: Shield, title: t('home.features.fast'), desc: t('home.features.fastDesc') },
    { icon: ThumbsUp, title: t('home.features.directions'), desc: t('home.features.directionsDesc') },
    { icon: BadgeCheck, title: t('home.features.guarantee'), desc: t('home.features.guaranteeDesc') },
  ];

  const promoCards = [
    {
      title: t('home.promo.telegram'),
      desc: t('home.promo.telegramDesc'),
      bgImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&q=80',
    },
    {
      title: t('home.promo.yuan'),
      desc: t('home.promo.yuanDesc'),
      bgImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=600&q=80',
    },
    {
      title: t('home.promo.review'),
      desc: t('home.promo.reviewDesc'),
      bgImage: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen relative z-10">
      {/* Promo Cards */}
      <section className="py-8 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {promoCards.map((card, index) => (
              <motion.div
                key={index}
                className="relative h-36 rounded-2xl overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${card.bgImage})` }}
                />
                {/* Dark Overlay with Orange Tint */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-orange-900/60" />
                {/* Content */}
                <div className="relative h-full p-5 flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-white font-bold text-lg mb-1">{card.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{card.desc}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center group-hover:bg-orange-500/40 transition-all">
                    <ArrowRight className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exchange Form Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <ExchangeForm />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="p-8 rounded-2xl bg-gray-800/30 border border-gray-700/50 text-center hover:border-orange-500/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="w-12 h-12 text-orange-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Coins */}
      <section className="py-12 border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold text-white">{t('home.popular')}</h2>
            <Link href="/rates" className="text-orange-400 hover:text-orange-300 flex items-center gap-1">
              {t('home.allRates')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-dark p-6 animate-pulse">
                  <div className="h-20 bg-gray-800 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coins.slice(0, 6).map((coin, index) => (
                <CoinCard key={coin.id} coin={coin} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
