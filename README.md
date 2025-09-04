# SafeKab Marketplace

A full-stack e-commerce marketplace with a Spring Boot backend and a modern React (TypeScript, Vite) frontend.

---

## Project Structure

### Backend (`/backend`)

- **Spring Boot REST API**
- JWT authentication & refresh tokens
- Stripe payment integration
- PostgreSQL database
- Modular structure:
  - `config/` – Security, payment, and role configuration
  - `controller/` – REST endpoints for auth, products, users, cart, orders, payments
  - `dto/` – Data transfer objects for API requests/responses
  - `entity/` – JPA entities (User, Product, Order, etc.)
  - `exception/` – Global exception handling
  - `middleware/` – JWT authentication filter
  - `repository/` – Spring Data JPA repositories
  - `service/` – Business logic for all modules
  - `token/` – JWT and refresh token utilities
  - `resources/` – `application.yml`, static assets, templates
  - `docker-compose.yml` – For local development with PostgreSQL
  - `pom.xml` – Maven build config

### Frontend (`/frontend`)

- **React + TypeScript + Vite**
- Tailwind CSS for styling
- Modular structure:
  - `src/components/` – UI components (buttons, cards, dialogs, etc.) and admin dashboard components
  - `src/pages/` – Main app pages (Home, Products, Cart, Checkout, Admin, etc.)
  - `src/context/` – React context for Auth, Cart, Config, Toast
  - `src/hooks/` – Custom hooks (API, VAT, click outside, etc.)
  - `src/models/` – TypeScript models for app data
  - `src/services/` – API and error handling utilities
  - `public/` – Static assets (logos, images)
  - `package.json` – Frontend dependencies and scripts

---

## Key Features

### 🛍️ Customer Experience

- Browse products with details and images
- Secure registration, login, and profile management
- Shopping cart and checkout with address collection
- Stripe payment integration

### 👨‍💼 Admin Features

- Product inventory management (add/edit/delete)
- Stock level tracking
- Order management
- Admin dashboard

### 🔒 Security & Authentication

- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Secure API endpoints

### 💳 Payment Processing

- Stripe checkout integration
- Secure payment processing

---

## Getting Started

### Backend

1. `cd backend`
2. Copy `application.yml` and configure your database/Stripe keys
3. Run with Maven:
   ```bash
   ./mvnw spring-boot:run
   ```
4. Or use Docker Compose:
   ```bash
   docker-compose up --build
   ```

### Frontend

1. `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

---

## Directory Overview

### Backend

```
backend/
  docker-compose.yml
  pom.xml
  src/
    main/java/com/safekab/market/
      config/         # Security, payment, role config
      controller/     # REST controllers (auth, product, user, cart, order, payment)
      dto/            # Data transfer objects
      entity/         # JPA entities
      exception/      # Exception handling
      middleware/     # JWT filter
      repository/     # JPA repositories
      service/        # Business logic
      token/          # JWT utilities
    resources/
      application.yml
      static/images/
      templates/
```

### Frontend

```
frontend/
  package.json
  vite.config.ts
  src/
    components/
      admin/          # Admin dashboard components
      ui/             # Reusable UI components
    context/          # React context providers
    hooks/            # Custom hooks
    models/           # TypeScript models
    pages/            # App pages
    services/         # API and error utils
    assets/           # Images, logos
  public/             # Static assets
```

---

## License

MIT

- Order status tracking
- Payment webhook handling

## Tech Stack

### Backend

- **Framework**: Spring Boot 3
- **Database**: PostgreSQL with JPA/Hibernate
- **Security**: Spring Security with JWT
- **Payment**: Stripe Java SDK
- **Build**: Maven
- **Java**: 21

### Frontend

- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite
- **Routing**: React Router DOM
- **HTTP**: Fetch API
- **State**: React Context API

## Project Structure

```
v3_safekab_button/
├── backend/                 # Spring Boot API
│   ├── src/
│   │   ├── main/java/com/safekab/market/
│   │   │   ├── controller/  # REST controllers
│   │   │   ├── service/     # Business logic
│   │   │   ├── entity/      # Database entities
│   │   │   ├── dto/         # Data transfer objects
│   │   │   ├── repository/  # Data access layer
│   │   │   ├── config/      # Configuration classes
│   │   │   └── exception/   # Exception handling
│   │   └── resources/
│   ├── docker-compose.yml   # PostgreSQL setup
│   └── pom.xml
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── services/        # API services
│   │   ├── contexts/        # React contexts
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Global styles
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Java 21
- Node.js 18+
- PostgreSQL (via Docker)
- Stripe account for payments

### 1. Database Setup

```bash
cd backend
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

Backend will start on: http://localhost:8080

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on: http://localhost:5173

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Database**: PostgreSQL on port 5432

## API Documentation

### Authentication Endpoints

```
POST /api/auth/login      - User login
POST /api/auth/register   - User registration
POST /api/auth/refresh    - Token refresh
```

### Product Endpoints

```
GET    /api/products           - Get all products (public)
POST   /api/admin/products     - Create product (admin)
PATCH  /api/admin/products     - Update product (admin)
```

### Cart & Orders

```
POST /api/cart/add        - Add to cart
POST /api/orders          - Create order
POST /api/payment/create  - Create payment
```

### User Management

```
GET  /api/user           - Get user profile
POST /api/user           - Update user profile
```

## Configuration

### Backend Configuration

All main settings are in `backend/src/main/resources/application.yml` and can be overridden with environment variables. Example structure:

```yaml
spring:
  application:
    name: market
  datasource:
    url: ${DATASOURCE_URL:jdbc:postgresql://localhost:${DATASOURCE_PORT:5432}/${DATASOURCE_DB:market}}
    username: ${DATASOURCE_USERNAME:user}
    password: ${DATASOURCE_PASSWORD:pass}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: update
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
    show-sql: false
    properties:
      hibernate:
        format_sql: true
app:
  server:
    url: ${SERVER_URL:http://localhost:8080}
    frontend:
      url: ${FRONTEND_URL:http://localhost:5173}
  token:
    secret: ${SAFEKAB_TOKEN_SECRET:your-jwt-secret}
    issuer: ${SAFEKAB_TOKEN_ISSUER:safekab}
    tokenType: ${TOKEN_TYPE:JWT}
    accessExpiration: 900000
    refreshExpiration: 604800000
  cors:
    allowed-origins: ${ALLOWED_ORIGINS:http://localhost:5173}
  payment:
    provider: ${PAYMENT_PROVIDER:stripe}
    api:
      key: ${STRIPE_API_KEY:sk_test_test}
    webhook:
      secret: ${STRIPE_WEBHOOK_SECRET:whsec_test}
    currency: gbp
```

**Environment variables you can set:**

- `DATASOURCE_URL`, `DATASOURCE_PORT`, `DATASOURCE_DB`, `DATASOURCE_USERNAME`, `DATASOURCE_PASSWORD`
- `SERVER_URL`, `FRONTEND_URL`
- `SAFEKAB_TOKEN_SECRET`, `SAFEKAB_TOKEN_ISSUER`, `TOKEN_TYPE`
- `ALLOWED_ORIGINS`
- `PAYMENT_PROVIDER`, `STRIPE_API_KEY`, `STRIPE_WEBHOOK_SECRET`, `CURRENCY`

You can use a `.env` file or set these in your deployment environment.

### Frontend Configuration

- The API base URL is set in `frontend/src/services/api.ts`:

  ```typescript
  const API_BASE_URL = "http://localhost:8080/api";
  ```

- For production, update this value or use environment variables (e.g., `.env` or `import.meta.env`) as needed for deployment.

**Backend**:

```bash
cd backend
./mvnw test
```

**Frontend**:

```bash
cd frontend
npm run build  # Check for build errors
npm run lint   # Check code style
```

## Deployment

### Backend Deployment

1. Build the JAR file: `./mvnw clean package`
2. Deploy to your server with Java 21
3. Configure database connection
4. Set up environment variables for Stripe

### Frontend Deployment

1. Build the app: `npm run build`
2. Serve the `dist/` folder with a web server
3. Configure API base URL for production

## Environment Variables

### Backend (.env)

```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/safekab_market
SPRING_DATASOURCE_USERNAME=safekab_user
SPRING_DATASOURCE_PASSWORD=your_password
STRIPE_API_KEY=sk_test_your_stripe_key
SAFEKAB_TOKEN_SECRET=your-jwt-secret
```

### Frontend

Set production API URL in build configuration
