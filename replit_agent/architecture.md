# WindoorConfig System Architecture

## Overview

WindoorConfig is a professional Single Page Application (SPA) designed for window and door manufacturing companies to create, configure, and generate PDF offers. The system enables users to configure complex window and door products with various options, calculate pricing, and generate professional PDF offers for clients.

The application follows a client-server architecture with a clear separation between the frontend and backend components. It implements a modern stack with React for the frontend and FastAPI for the backend, using PostgreSQL for data persistence.

## System Architecture

The system follows a layered architecture with the following key components:

```
WindoorConfig
├── Frontend (React SPA)
│   ├── UI Components
│   ├── State Management (Zustand)
│   ├── Routing (React Router)
│   └── API Client (Axios)
│
├── Backend (FastAPI)
│   ├── API Layer
│   ├── Service Layer
│   ├── Data Access Layer (SQLAlchemy)
│   └── PDF Generation (Jinja2 + WeasyPrint)
│
└── Database (PostgreSQL)
    ├── User Data
    ├── Offer Data
    └── Configuration Options
```

### Authentication Flow

The system uses JWT (JSON Web Tokens) for authentication:

1. User submits credentials (username/password)
2. Backend validates credentials and issues a JWT token
3. Frontend stores the token in localStorage
4. Subsequent API requests include the token in the Authorization header
5. Backend validates the token for protected endpoints

## Key Components

### Frontend Components

1. **Authentication Module**
   - Login and registration functionality
   - Token management and persistence
   - Protected route handling

2. **Offer Management**
   - Offer creation and editing interface
   - Product configuration with dynamic options
   - Price calculation based on selected options

3. **Admin Panel**
   - User management for administrators
   - Configuration options management
   - System settings

4. **State Management**
   - Zustand store for global application state
   - Authentication state
   - Current offer state

### Backend Components

1. **API Layer**
   - RESTful endpoints for client interaction
   - Request validation and response formatting
   - Authentication and authorization middleware

2. **Service Layer**
   - Business logic implementation
   - PDF generation service
   - Data processing and validation

3. **Data Access Layer**
   - SQLAlchemy ORM for database interactions
   - Database models and relationships
   - Query optimization

4. **PDF Generation**
   - Jinja2 templates for PDF structure
   - WeasyPrint for HTML-to-PDF conversion
   - Dynamic content generation based on offer data

### Database Models

1. **User**
   - User authentication and profile information
   - Role-based access control (admin/user)

2. **Offer**
   - Offer metadata (number, date, client, totals)
   - Relationship to offer items

3. **OfferItem**
   - Product specifications (type, dimensions)
   - Configuration options
   - Pricing information

4. **Option**
   - Configuration options for products
   - Categorized options with pricing

## Data Flow

### Offer Creation Flow

1. User authenticates and navigates to offer creation
2. User adds products and configures each with options
3. System calculates pricing based on dimensions and selected options
4. User finalizes the offer with customer information
5. Backend stores the offer data in the database
6. Backend generates a PDF based on the offer data when requested

### Configuration Options Flow

1. Options are loaded from a CSV file into the database during initialization
2. Frontend fetches options by category when configuring products
3. User selects options which affect the product price
4. Selected options are stored with the offer for future reference and PDF generation

## External Dependencies

### Frontend Dependencies

- React 18: UI framework
- TypeScript: Type safety and developer experience
- Vite: Build tool and development server
- TailwindCSS: Utility-first CSS framework
- Axios: HTTP client for API requests
- React Router: Client-side routing
- Zustand: State management
- React Hook Form: Form handling and validation

### Backend Dependencies

- FastAPI: Web framework for building APIs
- Uvicorn: ASGI server for FastAPI
- SQLAlchemy: ORM for database access
- PostgreSQL: Relational database
- Jinja2: Templating engine for PDF generation
- WeasyPrint: HTML-to-PDF conversion
- Python-Jose: JWT token handling
- Passlib: Password hashing
- Pydantic: Data validation and settings management

## Deployment Strategy

The application is configured to run in various environments:

1. **Development Environment**
   - Separate frontend and backend servers
   - Hot reloading for quick development
   - Local PostgreSQL database

2. **Production Environment**
   - Backend serves the frontend static files
   - Single server deployment
   - Production-ready PostgreSQL database

The deployment configuration in `.replit` shows the system is set up to run on Replit's platform with:

- Node.js 20 for frontend
- Python 3.11 for backend
- PostgreSQL 16 for database
- Additional dependencies for PDF generation (Cairo, FFmpeg, etc.)

The system is configured to run the backend server which serves the API and also serves the frontend static files when built.

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with bcrypt
   - Role-based access control

2. **API Security**
   - Input validation with Pydantic models
   - CORS configuration to prevent unauthorized access
   - Protection against common web vulnerabilities

3. **Data Security**
   - Secure database connections
   - Parameterized queries to prevent SQL injection
   - Proper error handling to prevent information leakage