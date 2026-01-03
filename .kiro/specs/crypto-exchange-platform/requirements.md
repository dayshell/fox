# Requirements Document

## Introduction

Платформа для обмена криптовалют — веб-приложение, позволяющее пользователям просматривать курсы криптовалют и совершать обмен. Включает публичную часть (главная страница, отзывы, контакты) и административную панель для управления контентом.

## Glossary

- **Platform**: Веб-приложение для обмена криптовалют на базе Next.js
- **Admin_Panel**: Защищённая административная панель для управления контентом
- **Coin**: Криптовалюта с логотипом, названием и текущим курсом
- **Exchange_Rate**: Курс обмена криптовалюты
- **Payment_Details**: Реквизиты для обмена (банковские реквизиты, криптокошельки)
- **Review**: Отзыв пользователя о платформе
- **Language_Switcher**: Компонент переключения языка (русский/английский)

## Requirements

### Requirement 1: Отображение главной страницы

**User Story:** As a user, I want to see the main page with cryptocurrency list and exchange rates, so that I can choose which currency to exchange.

#### Acceptance Criteria

1. WHEN a user visits the main page, THE Platform SHALL display the logo and navigation menu
2. WHEN a user visits the main page, THE Platform SHALL display a list of available cryptocurrencies with their logos and current exchange rates
3. WHEN a user clicks on the Language_Switcher, THE Platform SHALL toggle between Russian and English languages
4. WHEN the language is changed, THE Platform SHALL persist the language preference and update all visible text
5. WHEN a user views the cryptocurrency list, THE Platform SHALL display smooth animations for card appearances

### Requirement 2: Страница отзывов

**User Story:** As a user, I want to read reviews from other users, so that I can trust the platform before making an exchange.

#### Acceptance Criteria

1. WHEN a user navigates to the reviews page, THE Platform SHALL display a list of user reviews
2. WHEN reviews are loaded, THE Platform SHALL show reviewer name, rating, date, and review text
3. WHEN the reviews page loads, THE Platform SHALL animate review cards with staggered fade-in effects

### Requirement 3: Страница контактов

**User Story:** As a user, I want to find contact information, so that I can reach out for support or inquiries.

#### Acceptance Criteria

1. WHEN a user navigates to the contacts page, THE Platform SHALL display contact information (email, phone, social links)
2. WHEN a user views the contacts page, THE Platform SHALL display a contact form for sending messages
3. IF a user submits an empty or invalid contact form, THEN THE Platform SHALL display validation errors

### Requirement 4: Управление криптовалютами в админ-панели

**User Story:** As an administrator, I want to add and manage cryptocurrencies, so that I can keep the exchange offerings up to date.

#### Acceptance Criteria

1. WHEN an administrator accesses the admin panel, THE Admin_Panel SHALL require authentication
2. WHEN an authenticated administrator views the coins section, THE Admin_Panel SHALL display a list of all Coins with edit and delete options
3. WHEN an administrator adds a new Coin, THE Admin_Panel SHALL save the coin name, symbol, logo URL, and current Exchange_Rate
4. WHEN an administrator updates an Exchange_Rate, THE Admin_Panel SHALL immediately reflect the change on the public pages
5. WHEN an administrator deletes a Coin, THE Admin_Panel SHALL remove it from the public listing

### Requirement 5: Управление реквизитами для обмена

**User Story:** As an administrator, I want to manage payment details and wallet addresses, so that users can complete exchanges.

#### Acceptance Criteria

1. WHEN an administrator views the payment details section, THE Admin_Panel SHALL display all configured Payment_Details
2. WHEN an administrator adds bank details, THE Admin_Panel SHALL save bank name, account number, and holder name
3. WHEN an administrator adds a crypto wallet, THE Admin_Panel SHALL save wallet address and associated Coin
4. WHEN an administrator updates Payment_Details, THE Admin_Panel SHALL validate the input format before saving
5. WHEN an administrator deletes Payment_Details, THE Admin_Panel SHALL remove them from the system

### Requirement 6: Управление отзывами

**User Story:** As an administrator, I want to manage user reviews, so that I can maintain quality content on the platform.

#### Acceptance Criteria

1. WHEN an administrator views the reviews section, THE Admin_Panel SHALL display all Reviews with moderation options
2. WHEN an administrator adds a Review, THE Admin_Panel SHALL save reviewer name, rating (1-5), date, and review text
3. WHEN an administrator deletes a Review, THE Admin_Panel SHALL remove it from the public reviews page

### Requirement 7: Анимации и визуальные эффекты

**User Story:** As a user, I want to see smooth animations throughout the platform, so that the experience feels modern and polished.

#### Acceptance Criteria

1. WHEN page elements load, THE Platform SHALL apply fade-in and slide-up animations
2. WHEN a user hovers over interactive elements, THE Platform SHALL display smooth hover transitions
3. WHEN navigating between pages, THE Platform SHALL apply page transition animations
4. WHEN cryptocurrency cards are displayed, THE Platform SHALL animate them with staggered delays

### Requirement 8: Мультиязычность

**User Story:** As a user, I want to switch between Russian and English, so that I can use the platform in my preferred language.

#### Acceptance Criteria

1. THE Platform SHALL support Russian and English languages
2. WHEN a user selects a language, THE Platform SHALL store the preference in local storage
3. WHEN the page reloads, THE Platform SHALL restore the previously selected language
4. THE Platform SHALL default to Russian language for new visitors

### Requirement 9: Хранение данных

**User Story:** As a system, I want to persist all data reliably, so that information is not lost.

#### Acceptance Criteria

1. THE Platform SHALL store all Coins, Exchange_Rates, Payment_Details, and Reviews in Firebase Firestore
2. WHEN data is created or updated, THE Platform SHALL sync changes in real-time
3. IF a database operation fails, THEN THE Platform SHALL display an appropriate error message
