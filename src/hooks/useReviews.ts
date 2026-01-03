'use client';

import { useState, useEffect, useCallback } from 'react';
import { Review } from '@/types';

const demoReviews: Review[] = [
  {
    id: '1',
    authorName: 'Александр К.',
    rating: 5,
    text: 'Отличный сервис! Обменял биткоин за 5 минут. Курс был даже лучше, чем на других площадках. Рекомендую всем!',
    date: new Date('2024-01-15'),
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    authorName: 'Мария С.',
    rating: 5,
    text: 'Пользуюсь уже полгода. Ни разу не подвели. Поддержка отвечает быстро, курсы выгодные.',
    date: new Date('2024-01-10'),
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    authorName: 'Дмитрий В.',
    rating: 4,
    text: 'Хороший обменник. Единственное - хотелось бы больше криптовалют для обмена. В остальном всё супер!',
    date: new Date('2024-01-05'),
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: '4',
    authorName: 'Елена П.',
    rating: 5,
    text: 'Очень удобный интерфейс и быстрая обработка заявок. Спасибо за отличную работу!',
    date: new Date('2023-12-28'),
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: '5',
    authorName: 'Игорь М.',
    rating: 5,
    text: 'Лучший обменник из всех, что я пробовал. Минимальная комиссия и честные курсы.',
    date: new Date('2023-12-20'),
    isPublished: true,
    createdAt: new Date(),
  },
  {
    id: '6',
    authorName: 'Анна Л.',
    rating: 4,
    text: 'Быстро и надёжно. Обменивала USDT на рубли - всё прошло гладко.',
    date: new Date('2023-12-15'),
    isPublished: true,
    createdAt: new Date(),
  },
];

const STORAGE_KEY = 'fxs_reviews';

function getStoredReviews(): Review[] {
  if (typeof window === 'undefined') return demoReviews;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.length > 0) {
        return parsed.map((r: any) => ({
          ...r,
          date: new Date(r.date),
          createdAt: new Date(r.createdAt),
        }));
      }
    } catch {}
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoReviews));
  return demoReviews;
}

function saveReviews(reviews: Review[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setReviews(getStoredReviews());
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
  }, [refresh]);

  const addReview = useCallback((data: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    saveReviews(updated);
    return newReview;
  }, [reviews]);

  const updateReview = useCallback((id: string, data: Partial<Review>) => {
    const updated = reviews.map(r => r.id === id ? { ...r, ...data } : r);
    setReviews(updated);
    saveReviews(updated);
  }, [reviews]);

  const deleteReview = useCallback((id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    setReviews(updated);
    saveReviews(updated);
  }, [reviews]);

  return { reviews, loading, addReview, updateReview, deleteReview, refresh };
}
