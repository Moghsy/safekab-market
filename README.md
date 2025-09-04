# SafeKab Marketplace

A full-stack marketplace application where you can sell products to customers. Built with Spring Boot backend and React frontend.

## Project Overview

This is a complete e-commerce solution consisting of:

- **Backend**: Spring Boot REST API with JWT authentication, Stripe payments, and PostgreSQL database
- **Frontend**: Modern React application with TypeScript, Tailwind CSS, and responsive design

## Features

### 🛍️ Customer Experience
- Browse products with detailed information
- Secure user registration and authentication
- Shopping cart management
- Checkout process with address collection
- Stripe payment integration
- User profile management

### 👨‍💼 Admin Features
- Product inventory management
- Add/edit products with images
- Stock level tracking
- Admin dashboard overview

### 🔒 Security & Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (USER/ADMIN)
- Secure API endpoints
- CORS configuration

### 💳 Payment Processing
- Stripe checkout integration
- Secure payment processing
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
- **HTTP**: Axios
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
Key settings in `application.yml`:
```yaml
app:
  cors:
    allowed-origins: http://localhost:5173
  token:
    secret: your-jwt-secret
  payment:
    provider: stripe
    api:
      key: your-stripe-key
```

### Frontend Configuration
API base URL is configured in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## Development Workflow

### Adding New Features

1. **Backend Changes**:
   - Create/update entities in `entity/`
   - Add DTOs in `dto/`
   - Implement business logic in `service/`
   - Create REST endpoints in `controller/`
   - Add tests

2. **Frontend Changes**:
   - Define TypeScript types in `types/`
   - Create API service functions in `services/`
   - Build React components in `components/`
   - Add routing if needed
   - Update contexts for state management

### Testing

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

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `allowed-origins` in backend config
2. **Authentication**: Verify JWT secret and token expiration
3. **Database**: Ensure PostgreSQL is running and accessible
4. **Payments**: Confirm Stripe keys and webhook configuration
5. **Build Errors**: Check Node.js and Java versions

### Getting Help

1. Check the logs for detailed error messages
2. Verify all environment variables are set
3. Ensure database migrations have run
4. Test API endpoints with Postman/curl
5. Use browser dev tools for frontend debugging

## Features to Add

- [ ] Order history and tracking
- [ ] Email notifications
- [ ] Product categories and search
- [ ] Product reviews and ratings
- [ ] Inventory alerts
- [ ] Advanced admin analytics
- [ ] Mobile app support
- [ ] Multi-vendor support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

# safekab-market
# safekab-market
