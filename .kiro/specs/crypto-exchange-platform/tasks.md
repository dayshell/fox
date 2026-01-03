# Implementation Plan: Crypto Exchange Platform

## Overview

Пошаговая реализация платформы обмена криптовалют на Next.js 14 с Firebase Firestore. Задачи организованы от базовой настройки к полной функциональности.

## Tasks

- [x] 1. Инициализация проекта и базовая настройка
  - [x] 1.1 Создать Next.js 14 проект с TypeScript и Tailwind CSS
    - Инициализировать проект командой `npx create-next-app@latest`
    - Настроить TypeScript, Tailwind CSS, App Router
    - _Requirements: 9.1_
  - [x] 1.2 Установить зависимости
    - firebase, framer-motion, lucide-react
    - _Requirements: 7.1, 9.1_
  - [x] 1.3 Создать типы данных
    - Определить интерфейсы Coin, PaymentDetails, Review, ContactFormData
    - Создать файл `src/types/index.ts`
    - _Requirements: 4.3, 5.2, 6.2_

- [x] 2. Настройка Firebase и утилит
  - [x] 2.1 Настроить Firebase конфигурацию
    - Создать `src/lib/firebase.ts` с инициализацией Firebase
    - Настроить Firestore и Auth
    - _Requirements: 9.1_
  - [x] 2.2 Создать Firestore утилиты
    - CRUD функции для coins, payments, reviews
    - Создать `src/lib/firestore.ts`
    - _Requirements: 9.1, 9.2_

- [x] 3. Мультиязычность
  - [x] 3.1 Создать контекст языка
    - Создать `src/context/LanguageContext.tsx`
    - Реализовать сохранение в localStorage
    - _Requirements: 8.2, 8.3, 8.4_
  - [x] 3.2 Создать файлы переводов
    - Создать `src/messages/ru.json` и `src/messages/en.json`
    - Добавить все необходимые ключи переводов
    - _Requirements: 8.1_
  - [ ]* 3.3 Написать property-тест для сохранения языка
    - **Property 5: Language Preference Persistence**
    - **Validates: Requirements 8.2, 8.3**

- [x] 4. Базовые компоненты UI
  - [x] 4.1 Создать компонент Header
    - Логотип, навигация, переключатель языка
    - Создать `src/components/Header.tsx`
    - _Requirements: 1.1, 1.3_
  - [x] 4.2 Создать компонент Footer
    - Создать `src/components/Footer.tsx`
    - _Requirements: 1.1_
  - [x] 4.3 Создать компонент LanguageSwitcher
    - Переключение RU/EN с анимацией
    - Создать `src/components/LanguageSwitcher.tsx`
    - _Requirements: 1.3, 1.4_
  - [x] 4.4 Создать корневой layout
    - Обернуть в LanguageProvider
    - Подключить Header и Footer
    - _Requirements: 1.1_

- [x] 5. Checkpoint - Базовая структура
  - Убедиться, что проект запускается без ошибок
  - Проверить переключение языка

- [x] 6. Главная страница
  - [x] 6.1 Создать компонент CoinCard
    - Карточка криптовалюты с анимацией
    - Логотип, название, курсы покупки/продажи
    - Создать `src/components/CoinCard.tsx`
    - _Requirements: 1.2, 1.5, 7.1, 7.2_
  - [x] 6.2 Создать хук useCoins
    - Получение монет из Firestore
    - Создать `src/hooks/useCoins.ts`
    - _Requirements: 1.2, 9.2_
  - [x] 6.3 Реализовать главную страницу
    - Hero секция, список криптовалют
    - Staggered анимации карточек
    - Обновить `src/app/page.tsx`
    - _Requirements: 1.1, 1.2, 1.5, 7.4_
  - [ ]* 6.4 Написать property-тест для отображения монет
    - **Property 3: All Active Items Displayed**
    - **Validates: Requirements 1.2**

- [x] 7. Страница отзывов
  - [x] 7.1 Создать компонент ReviewCard
    - Карточка отзыва с рейтингом звёздами
    - Анимация появления
    - Создать `src/components/ReviewCard.tsx`
    - _Requirements: 2.2, 2.3, 7.1_
  - [x] 7.2 Создать хук useReviews
    - Получение отзывов из Firestore
    - Создать `src/hooks/useReviews.ts`
    - _Requirements: 2.1, 9.2_
  - [x] 7.3 Реализовать страницу отзывов
    - Список отзывов со staggered анимацией
    - Создать `src/app/reviews/page.tsx`
    - _Requirements: 2.1, 2.2, 2.3_
  - [ ]* 7.4 Написать property-тест для отображения отзывов
    - **Property 4: Review Display Contains Required Fields**
    - **Validates: Requirements 2.2**

- [x] 8. Страница контактов
  - [x] 8.1 Создать функции валидации
    - Валидация email, обязательных полей
    - Создать `src/lib/validations.ts`
    - _Requirements: 3.3_
  - [x] 8.2 Создать компонент ContactForm
    - Форма с валидацией и анимациями
    - Создать `src/components/ContactForm.tsx`
    - _Requirements: 3.2, 3.3_
  - [x] 8.3 Реализовать страницу контактов
    - Контактная информация и форма
    - Создать `src/app/contacts/page.tsx`
    - _Requirements: 3.1, 3.2_
  - [ ]* 8.4 Написать property-тест для валидации формы
    - **Property 6: Contact Form Validation**
    - **Validates: Requirements 3.3**

- [x] 9. Checkpoint - Публичная часть
  - Убедиться, что все публичные страницы работают
  - Проверить анимации и переключение языка

- [x] 10. Админ-панель: Аутентификация
  - [x] 10.1 Создать страницу входа
    - Форма логина с Firebase Auth
    - Создать `src/app/admin/login/page.tsx`
    - _Requirements: 4.1_
  - [x] 10.2 Создать middleware для защиты админ-роутов
    - Проверка аутентификации
    - Редирект на логин
    - _Requirements: 4.1_
  - [x] 10.3 Создать layout админ-панели
    - Sidebar с навигацией
    - Создать `src/app/admin/layout.tsx`
    - Создать `src/components/admin/AdminSidebar.tsx`
    - _Requirements: 4.1_

- [x] 11. Админ-панель: Управление монетами
  - [x] 11.1 Создать форму добавления/редактирования монеты
    - Поля: название, символ, логотип, курсы
    - Создать `src/components/admin/CoinForm.tsx`
    - _Requirements: 4.3_
  - [x] 11.2 Реализовать страницу управления монетами
    - Список монет, добавление, редактирование, удаление
    - Создать `src/app/admin/coins/page.tsx`
    - _Requirements: 4.2, 4.3, 4.4, 4.5_
  - [ ]* 11.3 Написать property-тест для CRUD монет
    - **Property 1: Data Persistence Round-Trip**
    - **Property 2: Delete Removes From System**
    - **Validates: Requirements 4.3, 4.5**

- [x] 12. Админ-панель: Управление реквизитами
  - [x] 12.1 Создать форму добавления реквизитов
    - Банковские реквизиты и криптокошельки
    - Валидация по типу
    - Создать `src/components/admin/PaymentForm.tsx`
    - _Requirements: 5.2, 5.3, 5.4_
  - [x] 12.2 Создать хук usePayments
    - CRUD операции для реквизитов
    - Создать `src/hooks/usePayments.ts`
    - _Requirements: 5.1, 9.2_
  - [x] 12.3 Реализовать страницу управления реквизитами
    - Список реквизитов, добавление, редактирование, удаление
    - Создать `src/app/admin/payments/page.tsx`
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  - [ ]* 12.4 Написать property-тест для валидации реквизитов
    - **Property 8: Payment Details Validation**
    - **Validates: Requirements 5.4**

- [x] 13. Админ-панель: Управление отзывами
  - [x] 13.1 Создать форму добавления отзыва
    - Поля: автор, рейтинг, текст, дата
    - Создать `src/components/admin/ReviewForm.tsx`
    - _Requirements: 6.2_
  - [x] 13.2 Реализовать страницу управления отзывами
    - Список отзывов, добавление, удаление
    - Создать `src/app/admin/reviews/page.tsx`
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 14. Checkpoint - Админ-панель
  - Убедиться, что все CRUD операции работают
  - Проверить синхронизацию с публичной частью

- [x] 15. Финальная полировка
  - [x] 15.1 Добавить страницу 404
    - Создать `src/app/not-found.tsx`
    - _Requirements: 9.3_
  - [x] 15.2 Добавить обработку ошибок Firebase
    - Toast уведомления об ошибках
    - _Requirements: 9.3_
  - [x] 15.3 Оптимизировать анимации
    - Проверить производительность
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 16. Final Checkpoint
  - Убедиться, что все тесты проходят
  - Проверить работу всех страниц
  - Запустить проект и проверить функциональность

## Notes

- Задачи с `*` являются опциональными (тесты) и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property-тесты валидируют универсальные свойства корректности
