# Настройка FoxPays Integration

## Проблема которая была исправлена

В предыдущей версии **отсутствовал обязательный параметр `merchant_id`**, который требуется согласно документации FoxPays API.

## Что было исправлено

### 1. Добавлен merchant_id в параметры

**src/types/foxpays.ts:**
```typescript
export interface CreateFoxPaysOrderParams {
  external_id: string;        // Обязательный
  amount: number;             // Обязательный
  merchant_id: string;        // Обязательный (БЫЛО ПРОПУЩЕНО!)
  payment_gateway?: string;   // Опциональный
  currency?: string;          // Опциональный
  payment_detail_type?: FoxPaysDetailType;
  callback_url?: string;
  is_transgran?: '0' | '1';
}
```

### 2. Обновлен .env.local

Добавлена новая переменная окружения:

```env
FOXPAYS_MERCHANT_ID=your-merchant-uuid-here
```

### 3. Обновлен API route

**src/app/api/foxpays/order/route.ts:**
- Добавлено чтение `FOXPAYS_MERCHANT_ID` из env
- Добавлена валидация наличия merchant_id
- Исправлена логика: теперь либо `currency` либо `payment_gateway` (не оба обязательны)
- Улучшена обработка ошибок

## Инструкция по настройке

### Шаг 1: Получите Merchant ID

1. Войдите в админку FoxPays: https://panel.foxpays.top
2. Перейдите в раздел **"Интеграция"** или **"Настройки мерчанта"**
3. Найдите **Merchant ID** (UUID формат, например: `3db07a16-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Скопируйте его

### Шаг 2: Обновите .env.local

Откройте файл `.env.local` и добавьте/обновите:

```env
# FoxPays API Configuration
FOXPAYS_API_URL=https://panel.foxpays.top
FOXPAYS_ACCESS_TOKEN=w8qnkzkk4c5a3mucawjqndlpkdhnyyvz
FOXPAYS_MERCHANT_ID=ваш-merchant-id-здесь
```

### Шаг 3: Перезапустите сервер

```bash
# Остановите текущий процесс (Ctrl+C)
npm run dev
```

## Проверка работы

### 1. Проверка подключения

Откройте админку: http://localhost:3000/admin/settings

В разделе FoxPays должно быть:
- ✅ Статус: Подключено
- ✅ Доступные валюты загружены
- ✅ Платежные методы загружены

### 2. Тестовый заказ

1. Перейдите на главную страницу
2. Выберите обмен (например, RUB → BTC)
3. Введите сумму
4. Нажмите "Обменять"
5. Должна открыться страница оплаты с реквизитами

### 3. Проверка логов

Откройте консоль браузера (F12) и проверьте логи:

```
[FoxPays] Creating order with params: {
  external_id: "FX...",
  amount: 1000,
  merchant_id: "3db07a16-...",
  payment_gateway: "sberbank"
}

[FoxPays] Order created successfully: 3db07a16-...
```

## Возможные ошибки

### Ошибка: "FoxPays не настроен"

**Причина:** Не указаны переменные окружения

**Решение:**
1. Проверьте `.env.local`
2. Убедитесь что все 3 переменные заполнены:
   - FOXPAYS_API_URL
   - FOXPAYS_ACCESS_TOKEN
   - FOXPAYS_MERCHANT_ID
3. Перезапустите сервер

### Ошибка: "Необходимо указать currency или payment_gateway"

**Причина:** Не передан ни один из параметров

**Решение:** При создании заказа передайте либо:
- `currency: "rub"` - для любого метода в этой валюте
- `payment_gateway: "sberbank"` - для конкретного метода

### Ошибка 401: Unauthorized

**Причина:** Неверный Access Token

**Решение:**
1. Проверьте токен в админке FoxPays
2. Обновите `FOXPAYS_ACCESS_TOKEN` в `.env.local`
3. Перезапустите сервер

### Ошибка 422: Validation Error

**Причина:** Неверные параметры запроса

**Решение:** Проверьте логи в консоли, там будет детальное описание ошибки:
```json
{
  "message": "Общее описание ошибки",
  "errors": {
    "amount": ["Сумма должна быть больше 1000"],
    "merchant_id": ["Мерчант не найден"]
  }
}
```

### Ошибка: "Не удалось обработать запрос вовремя"

**Причина:** Высокая нагрузка на FoxPays API

**Решение:** Повторите запрос через несколько секунд

## Параметры API

### Обязательные параметры

- `external_id` - уникальный ID заказа (генерируется автоматически)
- `amount` - сумма в целых числах (например, 1000 = 1000 RUB)
- `merchant_id` - UUID мерчанта из админки

### Опциональные параметры

- `payment_gateway` - код платежного метода (например, "sberbank")
- `currency` - код валюты (например, "rub")
- `payment_detail_type` - тип реквизита: "card", "phone", "account_number", "qrcode"
- `callback_url` - URL для webhook уведомлений
- `is_transgran` - "1" только трансграничные, "0" исключить трансграничные

**Важно:** Либо `payment_gateway` либо `currency` должен быть указан (не оба одновременно)

## Дополнительные возможности

### Webhook уведомления

Для получения уведомлений об изменении статуса заказа:

1. Создайте endpoint в вашем API (например, `/api/foxpays/webhook`)
2. Передайте URL при создании заказа:
   ```typescript
   {
     amount: 1000,
     currency: "rub",
     callback_url: "https://yourdomain.com/api/foxpays/webhook"
   }
   ```
3. FoxPays отправит POST запрос с данными заказа при изменении статуса

### Фильтр трансграничных платежей

Для работы с трансграничными платежами:

```typescript
{
  amount: 1000,
  currency: "rub",
  is_transgran: "1"  // Только трансграничные
}
```

Или исключить трансграничные:

```typescript
{
  amount: 1000,
  currency: "rub",
  is_transgran: "0"  // Без трансграничных
}
```

## Статусы заказов

### Основные статусы (status)

- `pending` - Ожидание
- `success` - Успешно
- `fail` - Ошибка

### Подстатусы (sub_status)

- `waiting_for_payment` - Ожидание оплаты
- `successfully_paid` - Оплачен
- `expired` - Истекло время
- `cancelled` - Отменен
- И другие (см. документацию)

## Поддержка

Если проблема не решена:

1. Проверьте логи в консоли браузера (F12)
2. Проверьте логи сервера в терминале
3. Свяжитесь с поддержкой FoxPays: https://t.me/FoxSwap_Exchange
