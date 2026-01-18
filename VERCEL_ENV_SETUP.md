# Настройка переменных окружения на Vercel

Для корректной работы FoxPays в любом браузере необходимо настроить переменные окружения на Vercel.

## Шаги настройки:

1. Откройте панель управления Vercel (https://vercel.com)
2. Перейдите в ваш проект
3. Откройте **Settings** → **Environment Variables**
4. Добавьте следующие переменные:

### Обязательные переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `FOXPAYS_API_URL` | `https://panel.foxpays.top` | Production, Preview, Development |
| `FOXPAYS_ACCESS_TOKEN` | `xo3ztmafovqs0kuarwtmuptsrlpe3aau` | Production, Preview, Development |
| `FOXPAYS_MERCHANT_ID` | `3adc5077-20bb-4058-8075-6e55a5d92674` | Production, Preview, Development |

### Дополнительные переменные:

| Name | Value | Environment |
|------|-------|-------------|
| `TELEGRAM_BOT_TOKEN` | `8268271231:AAFwYm06zfTf342aFd1p-dEZ39nXS5KW1nY` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | `https://foxswap.top` | Production, Preview, Development |

## После добавления переменных:

1. Сохраните изменения
2. Перейдите в **Deployments**
3. Найдите последний деплой и нажмите на три точки → **Redeploy**
4. Выберите **Redeploy** (не "Redeploy with existing Build Cache")

Это пересоберет и перезапустит сайт с новыми переменными окружения.

## Проверка:

После деплоя:
1. Откройте сайт в режиме инкогнито или в новом браузере
2. Создайте заказ
3. Реквизиты должны отображаться корректно

## Важно:

- Переменные окружения на Vercel имеют приоритет над файлами `.env`
- После изменения переменных ОБЯЗАТЕЛЬНО нужен новый деплой (не просто Redeploy with cache!)
- Переменные БЕЗ префикса `NEXT_PUBLIC_` доступны только на сервере (API routes)
- Убедитесь, что выбрали все три окружения: Production, Preview, Development

## Текущие настройки:

- **API URL**: https://panel.foxpays.top
- **Access Token**: xo3ztmafovqs0kuarwtmuptsrlpe3aau
- **Merchant ID**: 3adc5077-20bb-4058-8075-6e55a5d92674

## Отладка:

Если реквизиты все еще не появляются:

1. Откройте консоль браузера (F12)
2. Перейдите на вкладку Network
3. Создайте заказ
4. Найдите запрос к `/api/foxpays/order/[orderId]`
5. Проверьте ответ - должны быть `paymentDetail` с данными
6. Если ошибка "FoxPays не настроен" - переменные не применились, нужен новый деплой
