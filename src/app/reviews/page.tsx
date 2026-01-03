'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useReviews } from '@/hooks/useReviews';
import ReviewCard from '@/components/ReviewCard';
import { MessageSquare, Star } from 'lucide-react';

export default function ReviewsPage() {
  const { t } = useLanguage();
  const { reviews, loading } = useReviews();

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen py-12 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('reviews.title')}
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            {t('reviews.subtitle')}
          </p>

          {/* Average Rating */}
          <motion.div
            className="flex items-center justify-center gap-3 mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(Number(averageRating))
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-700'
                  }`}
                />
              ))}
            </div>
            <span className="text-xl font-bold text-white">{averageRating}</span>
            <span className="text-gray-500">({reviews.length} отзывов)</span>
          </motion.div>
        </motion.div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="h-32 bg-gray-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{t('reviews.empty')}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <ReviewCard key={review.id} review={review} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
