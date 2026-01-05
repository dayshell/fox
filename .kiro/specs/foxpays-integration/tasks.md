# Implementation Plan: FoxPays Integration

## Overview

Пошаговая интеграция платежной системы FoxPays для получения динамических реквизитов при обмене криптовалют. Задачи организованы от базовой настройки к полной функциональности.

## Tasks

- [x] 1. Типы данных и FoxPays клиент
  - [x] 1.1 Создать типы для FoxPays API
    - Определить интерфейсы PaymentGateway, H2HOrder, CreateOrderParams
    - Создать файл `src/types/foxpays.ts`
    - _Requirements: 2.2, 3.2_
  - [x] 1.2 Создать FoxPays клиент
    - Реализовать класс FoxPaysClient с методами API
    - Создать файл `src/lib/foxpays.ts`
    - _Requirements: 3.1, 5.1, 7.2_
  - [ ]* 1.3 Написать property-тест для валидации входных данных
    - **Property 12: Input Validation Before API Call**
    - **Validates: Requirements 9.3**

- [x] 2. API Routes для FoxPays
  - [x] 2.1 Создать route для получения платежных методов
    - GET /api/foxpays/gateways
    - Кэширование на 5 минут
    - Создать `src/app/api/foxpays/gateways/route.ts`
    - _Requirements: 2.1, 2.4_
  - [x] 2.2 Создать route для создания заказа
    - POST /api/foxpays/order
    - Валидация входных данных
    - Сохранение в Firebase
    - Создать `src/app/api/foxpays/order/route.ts`
    - _Requirements: 3.1, 8.1, 8.2_
  - [x] 2.3 Создать route для получения статуса заказа
    - GET /api/foxpays/order/[orderId]
    - Синхронизация статуса с Firebase
    - Создать `src/app/api/foxpays/order/[orderId]/route.ts`
    - _Requirements: 6.1, 8.3_
  - [x] 2.4 Создать route для подтверждения оплаты
    - PATCH /api/foxpays/order/[orderId]/confirm
    - Создать `src/app/api/foxpays/order/[orderId]/confirm/route.ts`
    - _Requirements: 5.1_
  - [x] 2.5 Создать route для отмены заказа
    - PATCH /api/foxpays/order/[orderId]/cancel
    - Создать `src/app/api/foxpays/order/[orderId]/cancel/route.ts`
    - _Requirements: 7.2_
  - [ ]* 2.6 Написать property-тест для безопасности API
    - **Property 11: Access Token Not Exposed**
    - **Validates: Requirements 9.2**

- [x] 3. Checkpoint - API Routes
  - Убедиться, что все API routes работают
  - Проверить что токен не утекает в ответах

- [x] 4. React хуки для FoxPays
  - [x] 4.1 Создать хук useFoxPaysGateways
    - Получение и кэширование платежных методов
    - Создать `src/hooks/useFoxPaysGateways.ts`
    - _Requirements: 2.1, 2.4_
  - [x] 4.2 Создать хук useFoxPaysOrder
    - Создание заказа, подтверждение, отмена
    - Создать `src/hooks/useFoxPaysOrder.ts`
    - _Requirements: 3.1, 5.1, 7.2_
  - [x] 4.3 Создать хук useOrderStatus
    - Polling статуса каждые 10 секунд
    - Создать `src/hooks/useOrderStatus.ts`
    - _Requirements: 6.1_

- [x] 5. UI компоненты
  - [x] 5.1 Создать компонент CopyButton
    - Кнопка копирования с анимацией
    - Создать `src/components/CopyButton.tsx`
    - _Requirements: 4.1, 4.2_
  - [x] 5.2 Создать компонент PaymentTimer
    - Таймер обратного отсчета
    - Callback при истечении времени
    - Создать `src/components/PaymentTimer.tsx`
    - _Requirements: 4.4_
  - [ ]* 5.3 Написать property-тест для таймера
    - **Property 6: Timer Countdown Accuracy**
    - **Validates: Requirements 4.4**
  - [x] 5.4 Создать компонент PaymentGatewaySelector
    - Выбор платежного метода с лимитами
    - Создать `src/components/PaymentGatewaySelector.tsx`
    - _Requirements: 2.2, 2.3_
  - [ ]* 5.5 Написать property-тест для селектора
    - **Property 2: Payment Gateway Display Contains Required Fields**
    - **Property 3: Unavailable Gateways Are Hidden**
    - **Validates: Requirements 2.2, 2.3**
  - [x] 5.6 Создать компонент PaymentDetails
    - Отображение реквизитов по типу (карта/телефон/QR)
    - Создать `src/components/PaymentDetails.tsx`
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  - [ ]* 5.7 Написать property-тест для отображения реквизитов
    - **Property 4: Order Display Contains All Required Fields**
    - **Property 5: Payment Details Rendered By Type**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.5**
  - [x] 5.8 Создать компонент OrderStatus
    - Отображение статуса заказа
    - Создать `src/components/OrderStatus.tsx`
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  - [ ]* 5.9 Написать property-тест для статуса
    - **Property 7: Status Display Is Human-Readable**
    - **Property 8: Cancel Button Visibility**
    - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 7.1**

- [x] 6. Checkpoint - UI компоненты
  - Убедиться, что все компоненты рендерятся корректно
  - Проверить копирование и таймер

- [x] 7. Страница заказа
  - [x] 7.1 Создать страницу статуса заказа
    - Отображение реквизитов и статуса
    - Кнопки подтверждения и отмены
    - Создать `src/app/order/[orderId]/page.tsx`
    - _Requirements: 3.2, 4.1, 4.2, 4.3, 5.1, 6.1, 7.1_
  - [x] 7.2 Обновить страницу обмена
    - Интегрировать выбор платежного метода
    - Создание заказа через FoxPays
    - Обновить `src/app/exchange/page.tsx`
    - _Requirements: 2.1, 3.1_

- [-] 8. Админ-панель
  - [x] 8.1 Создать страницу настроек FoxPays
    - Форма для API credentials
    - Проверка подключения
    - Создать `src/app/admin/settings/foxpays/page.tsx`
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [ ]* 8.2 Написать property-тест для сохранения настроек
    - **Property 1: API Credentials Round-Trip**
    - **Validates: Requirements 1.2**
  - [ ] 8.3 Обновить страницу заказов в админке
    - Отображение всех заказов с FoxPays
    - Статусы и детали
    - Обновить `src/app/admin/orders/page.tsx`
    - _Requirements: 8.4_
  - [ ]* 8.4 Написать property-тест для хранения заказов
    - **Property 9: Order Persistence Round-Trip**
    - **Property 10: Order Status Sync**
    - **Validates: Requirements 8.1, 8.2, 8.3**

- [x] 9. Локализация
  - [x] 9.1 Добавить переводы для FoxPays
    - Обновить ru.json и en.json
    - Статусы, ошибки, UI тексты
    - _Requirements: 6.5_

- [x] 10. Final Checkpoint
  - Убедиться, что все тесты проходят
  - Проверить полный флоу создания заказа
  - Проверить работу с реальным API (тестовые credentials)

## Notes

- Задачи с `*` являются опциональными (тесты) и могут быть пропущены для быстрого MVP
- Каждая задача ссылается на конкретные требования для трассируемости
- Checkpoints обеспечивают инкрементальную валидацию
- Property-тесты валидируют универсальные свойства корректности
- Все API вызовы к FoxPays делаются только с сервера (API routes)
