'use client';

import { motion } from 'framer-motion';
import { Review } from '@/types';
import { Star, Quote } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  index: number;
}

export default function ReviewCard({ review, index }: ReviewCardProps) {
  return (
    <motion.div
      className="card-dark p-6 relative overflow-hidden group hover:border-orange-500/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Quote className="w-12 h-12 text-orange-400" />
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < review.rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Review Text */}
      <p className="text-gray-300 mb-4 line-clamp-4">
        "{review.text}"
      </p>

      {/* Author & Date */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
            <span className="text-white font-semibold">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-white font-medium">{review.authorName}</span>
        </div>
        <span className="text-gray-600 text-sm">
          {new Date(review.date).toLocaleDateString('ru-RU')}
        </span>
      </div>
    </motion.div>
  );
}
