# Настройка переменных окружения на Netlify

Для корректной работы FoxPays в любом браузере необходимо настроить переменные окружения на Netlify.

## Шаги настройки:

1. Откройте панель управления Netlify
2. Перейдите в ваш сайт
3. Откройте **Site settings** → **Environment variables**
4. Добавьте следующие переменные:

### Обязательные переменные:

```
FOXPAYS_API_URL=https://panel.foxpays.top
FOXPAYS_ACCESS_TOKEN=xo3ztmafovqs0kuarwtmuptsrlpe3aau
FOXPAYS_MERCHANT_ID=3adc5077-20bb-4058-8075-6e55a5d92674
```

### Дополнительные переменные:

```
TELEGRAM_BOT_TOKEN=8268271231:AAFwYm06zfTf342aFd1p-dEZ39nXS5KW1nY
NEXT_PUBLIC_SITE_URL=https://foxswap.top
```

## После добавления переменных:

1. Сохраните изменения
2. Перейдите в **Deploys**
3. Нажмите **Trigger deploy** → **Clear cache and deploy site**

Это перезапустит сайт с новыми переменными окружения.

## Проверка:

После деплоя откройте сайт в новом браузере (где нет настроек в localStorage) и создайте заказ. Реквизиты должны отображаться корректно.

## Важно:

- Переменные окружения на Netlify имеют приоритет над файлами `.env`
- После изменения переменных всегда нужен новый деплой
- Переменные с префиксом `NEXT_PUBLIC_` доступны на клиенте, остальные только на сервере

## Текущие настройки:

- **API URL**: https://panel.foxpays.top
- **Access Token**: xo3ztmafovqs0kuarwtmuptsrlpe3aau
- **Merchant ID**: 3adc5077-20bb-4058-8075-6e55a5d92674
