'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReviews } from '@/hooks/useReviews';
import ReviewForm from '@/components/admin/ReviewForm';
import { Plus, Trash2, Star, MessageSquare } from 'lucide-react';
import { Review } from '@/types';

export default function AdminReviewsPage() {
  const { reviews, loading, addReview, deleteReview } = useReviews();
  const [showForm, setShowForm] = useState(false);

  const handleSave = async (data: Partial<Review>) => {
    addReview(data as Omit<Review, 'id' | 'createdAt'>);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить этот отзыв?')) {
      deleteReview(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">Отзывы</h1>
          <p className="text-gray-500">Управление отзывами клиентов</p>
        </motion.div>

        <motion.button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-6 py-3 btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Добавить
        </motion.button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="card-dark p-6 animate-pulse">
              <div className="h-24 bg-gray-800 rounded" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <MessageSquare className="w-16 h-16 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Нет отзывов</p>
          </motion.div>
        ) : (
          reviews.map((review, index) => (
            <motion.div
              key={review.id}
              className="card-dark p-6 hover:border-orange-500/50 transition-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {review.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{review.authorName}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(review.date).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="flex gap-0.5 ml-auto">
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
                  </div>
                  <p className="text-gray-300">{review.text}</p>
                  <div className="mt-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      review.isPublished
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {review.isPublished ? 'Опубликован' : 'Скрыт'}
                    </span>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleDelete(review.id)}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 ml-4"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ReviewForm
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
