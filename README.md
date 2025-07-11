# 🚀 Windoor Config System

Professional SPA (Single Page Application) system for window and door configuration and PDF quote generation.

## ✨ Features

- **Modern SPA Architecture**: React + TypeScript frontend with FastAPI backend
- **PDF Generation**: Automated quote generation with WeasyPrint
- **User Authentication**: JWT-based authentication system
- **Database Integration**: PostgreSQL with SQLAlchemy ORM
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-time Updates**: Dynamic configuration updates
- **File Management**: Upload and download functionality
- **API Documentation**: Automated API docs with FastAPI
- **Docker Support**: Full containerization with Docker Compose
- **Auto-Deployment**: Ready for Render.com deployment

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Zustand for state management
- React Router for navigation
- Axios for API communication

### Backend
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- PostgreSQL database
- JWT authentication
- WeasyPrint for PDF generation
- Pydantic for data validation

### DevOps
- Docker & Docker Compose
- Nginx reverse proxy
- Automated deployment scripts
- Health checks and monitoring

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)
```bash
# Clone repository
git clone your-repo-url
cd windoor-config-system

# Setup environment
cp .env.example .env
# Edit .env with your values

# Start all services
./docker-local.sh start

# Check status
./docker-local.sh status

# Access application
open http://localhost:3000
```

### Option 2: Manual Setup
```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🌐 Deployment

### Render.com (Recommended)
```bash
# Automated deployment
./deploy-render.sh

# Follow the instructions to connect GitHub and deploy
```

### Manual Docker Deployment
```bash
# Build and run
docker-compose up -d

# Scale services
docker-compose up -d --scale backend=3
```

## 📋 Service URLs

### Development (Docker)
- **Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/health
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

### Production (Render.com)
- **Frontend**: https://windoor-config-frontend.onrender.com
- **Backend**: https://windoor-config-backend.onrender.com
- **API Health**: https://windoor-config-backend.onrender.com/api/health
- **API Docs**: https://windoor-config-backend.onrender.com/docs

## 🐳 Docker Commands

```bash
# Start services
./docker-local.sh start

# Stop services
./docker-local.sh stop

# View logs
./docker-local.sh logs

# Check status
./docker-local.sh status

# Build images
./docker-local.sh build

# Clean up
./docker-local.sh clean
```

## 📚 Documentation

- **Deployment Guide**: [RENDER_DEPLOYMENT_BLUEPRINT.md](RENDER_DEPLOYMENT_BLUEPRINT.md)
- **Render Instructions**: [INSTRUKCJE_RENDER_DEPLOYMENT.md](INSTRUKCJE_RENDER_DEPLOYMENT.md)
- **Architecture**: [Docker and Render](https://github.com/your-repo/wiki/Architecture)

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/windoor_config

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256

# Application
ENVIRONMENT=development
STORAGE_PATH=/app/storage
```

### Docker Compose Services
- **postgres**: PostgreSQL database
- **backend**: FastAPI application
- **frontend**: React application with Nginx
- **nginx**: Reverse proxy (production)
- **redis**: Caching (optional)

## 🛡️ Security Features

- JWT authentication
- CORS configuration
- Rate limiting
- Security headers
- Input validation
- SQL injection protection

## 📊 Monitoring

- Health checks for all services
- Structured logging
- Performance monitoring
- Error tracking
- Resource usage monitoring

## 🎯 Best Practices

- Multi-stage Docker builds
- Non-root containers
- Health checks
- Graceful shutdowns
- Connection pooling
- Static asset caching

## 📝 API Endpoints

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/offers` - List offers
- `POST /api/offers` - Create offer
- `GET /api/options` - Configuration options
- `GET /api/users` - User management

## 🚨 Troubleshooting

### Common Issues
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check DATABASE_URL in .env
3. **Build failures**: Run `./docker-local.sh clean` and rebuild
4. **Permission errors**: Ensure scripts are executable

### Debug Commands
```bash
# Check logs
./docker-local.sh logs

# Enter backend container
./docker-local.sh shell

# Check service status
./docker-local.sh status
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with Docker
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

**🚀 Ready for deployment!** Run `./deploy-render.sh` to get started.
