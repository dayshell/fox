'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Review } from '@/types';
import { X, Save, Loader2, Star } from 'lucide-react';

interface ReviewFormProps {
  review?: Review;
  onSave: (review: Partial<Review>) => Promise<void>;
  onCancel: () => void;
}

export default function ReviewForm({ review, onSave, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    authorName: review?.authorName || '',
    rating: review?.rating || 5,
    text: review?.text || '',
    date: review?.date ? new Date(review.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isPublished: review?.isPublished ?? true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ ...formData, date: new Date(formData.date) });
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card-dark p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {review ? 'Редактировать отзыв' : 'Добавить отзыв'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Имя автора</label>
            <input
              type="text"
              value={formData.authorName}
              onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
              className="w-full px-4 py-3 input-dark"
              placeholder="Иван И."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Рейтинг</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= formData.rating
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-700 hover:text-gray-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Текст отзыва</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 input-dark resize-none"
              placeholder="Отличный сервис..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Дата</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 input-dark"
              required
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-gray-300">Опубликован</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400">
              Отмена
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Сохранить</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
