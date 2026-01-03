'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/types';

// Demo data for development
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

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setReviews(demoReviews);
      setLoading(false);
    }, 500);
  }, []);

  return { reviews, loading, error };
}
