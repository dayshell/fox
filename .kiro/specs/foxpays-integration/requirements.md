# Requirements Document

## Introduction

Интеграция платежной системы FoxPays для динамического получения реквизитов при обмене криптовалют. Система будет создавать сделки через H2H API и получать актуальные реквизиты для оплаты (номер карты, телефон, QR-код).

## Glossary

- **FoxPays_API**: Внешний API платежной системы для создания сделок и получения реквизитов
- **H2H_Order**: Сделка, созданная через Host-to-Host API FoxPays
- **Payment_Gateway**: Платежный метод (Сбербанк, Тинькофф и т.д.)
- **Payment_Detail**: Реквизиты для оплаты (номер карты, телефон, QR-код)
- **Order_Status**: Статус сделки (pending, success, fail)
- **Exchange_Order**: Заявка на обмен криптовалюты в системе

## Requirements

### Requirement 1: Конфигурация FoxPays API

**User Story:** As an administrator, I want to configure FoxPays API credentials, so that the platform can connect to the payment system.

#### Acceptance Criteria

1. THE Admin_Panel SHALL provide a settings page for FoxPays API configuration
2. WHEN an administrator enters API credentials, THE Admin_Panel SHALL save the API base URL and Access-Token securely
3. WHEN API credentials are saved, THE Platform SHALL validate the connection by calling GET /api/currencies
4. IF the API connection fails, THEN THE Platform SHALL display an error message with details

### Requirement 2: Получение доступных платежных методов

**User Story:** As a user, I want to see available payment methods, so that I can choose how to pay for the exchange.

#### Acceptance Criteria

1. WHEN the exchange page loads, THE Platform SHALL fetch available payment gateways from FoxPays API
2. THE Platform SHALL display payment methods with their names, limits, and supported detail types
3. WHEN a payment method is unavailable, THE Platform SHALL hide it from the selection
4. THE Platform SHALL cache payment gateways for 5 minutes to reduce API calls

### Requirement 3: Создание сделки и получение реквизитов

**User Story:** As a user, I want to create an exchange order and receive payment details, so that I can complete the payment.

#### Acceptance Criteria

1. WHEN a user submits an exchange request, THE Platform SHALL create an H2H order via POST /api/h2h/order
2. WHEN the order is created successfully, THE Platform SHALL display the payment details (card number, phone, or QR-code)
3. THE Platform SHALL show the exact amount to pay including any fees
4. THE Platform SHALL display the payment deadline (expires_at)
5. THE Platform SHALL show the recipient name (initials) for verification
6. IF the order creation fails, THEN THE Platform SHALL display the error message from API

### Requirement 4: Отображение реквизитов для оплаты

**User Story:** As a user, I want to see clear payment instructions, so that I can complete the payment correctly.

#### Acceptance Criteria

1. WHEN payment details are of type "card", THE Platform SHALL display the card number with copy button
2. WHEN payment details are of type "phone", THE Platform SHALL display the phone number with copy button
3. WHEN payment details are of type "qrcode", THE Platform SHALL display the QR-code image
4. THE Platform SHALL display a countdown timer showing remaining time to pay
5. THE Platform SHALL show the payment gateway name (e.g., "Сбербанк")

### Requirement 5: Подтверждение оплаты

**User Story:** As a user, I want to confirm my payment, so that the exchange can be processed.

#### Acceptance Criteria

1. WHEN a user clicks "I paid", THE Platform SHALL call PATCH /api/h2h/order/{order_id}/confirm-client
2. WHEN payment is confirmed, THE Platform SHALL update the order status display
3. THE Platform SHALL allow uploading a payment receipt via POST /api/h2h/order/{order_id}/receipt
4. IF confirmation fails, THEN THE Platform SHALL display an error and allow retry

### Requirement 6: Отслеживание статуса сделки

**User Story:** As a user, I want to track my order status, so that I know when the exchange is complete.

#### Acceptance Criteria

1. THE Platform SHALL poll order status via GET /api/h2h/order/{order_id} every 10 seconds
2. WHEN order status changes to "success", THE Platform SHALL display a success message
3. WHEN order status changes to "fail", THE Platform SHALL display the failure reason
4. WHEN order expires, THE Platform SHALL display an expiration message and offer to create a new order
5. THE Platform SHALL display the current sub_status in human-readable format

### Requirement 7: Отмена сделки

**User Story:** As a user, I want to cancel my order if I change my mind, so that I'm not locked into a payment.

#### Acceptance Criteria

1. WHILE order status is "pending", THE Platform SHALL display a cancel button
2. WHEN a user clicks cancel, THE Platform SHALL call PATCH /api/h2h/order/{order_id}/cancel
3. WHEN cancellation succeeds, THE Platform SHALL update the UI to show cancelled status
4. IF cancellation fails, THEN THE Platform SHALL display the error reason

### Requirement 8: Хранение истории заказов

**User Story:** As a user, I want to see my order history, so that I can track my exchanges.

#### Acceptance Criteria

1. THE Platform SHALL store all created orders in Firebase with FoxPays order_id
2. WHEN an order is created, THE Platform SHALL save order details, amount, payment method, and timestamps
3. THE Platform SHALL sync order status updates from FoxPays to Firebase
4. THE Admin_Panel SHALL display all orders with their current statuses

### Requirement 9: Безопасность API

**User Story:** As a system, I want to protect API credentials, so that they cannot be exposed to clients.

#### Acceptance Criteria

1. THE Platform SHALL make all FoxPays API calls from server-side only (API routes)
2. THE Platform SHALL never expose Access-Token to the client
3. THE Platform SHALL validate all user inputs before sending to FoxPays API
4. THE Platform SHALL log all API errors for debugging without exposing sensitive data

