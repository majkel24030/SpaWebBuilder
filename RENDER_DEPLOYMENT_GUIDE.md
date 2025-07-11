# 🚀 Windoor Config System - Render Deployment Guide

## 📋 Przegląd Projektu

Aplikacja **Windoor Config System** to fullstack SPA składająca się z:
- **Backend**: FastAPI (Python) z PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Funkcjonalność**: System konfiguracji okien/drzwi z generowaniem ofert PDF

## 🎯 Szybki Start

### 1. Przygotowanie Projektu
```bash
# Sprawdź gotowość do deploymentu
./deploy-render.sh

# Lub użyj interaktywnego menu
./start.sh
```

### 2. Deployment na Render.com
1. Przejdź na [render.com](https://render.com)
2. Zaloguj się i kliknij **"New +"**
3. Wybierz **"Blueprint"**
4. Połącz z repozytorium GitHub
5. Render automatycznie wykryje `render.yaml` i utworzy wszystkie serwisy

## 📁 Struktura Plików Deployment

### Pliki Konfiguracyjne
- `render.yaml` - Główna konfiguracja Render.com
- `deploy-render.sh` - Skrypt automatycznego deploymentu
- `start.sh` - Interaktywne menu zarządzania
- `.env.example` - Template zmiennych środowiskowych

### Pliki Aplikacji
- `frontend/public/_redirects` - Routing dla SPA
- `frontend/package.json` - Konfiguracja build
- `backend/requirements.txt` - Zależności Pythona

## 🌐 Konfiguracja Render.com

### Backend Service
```yaml
name: windoor-config-backend
type: web
env: python
plan: free
region: frankfurt
buildCommand: "pip install -r backend/requirements.txt"
startCommand: "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 10000"
```

### Frontend Service
```yaml
name: windoor-config-frontend
type: static
buildCommand: "cd frontend && npm ci && npm run build"
publishPath: "frontend/dist"
```

### Database
```yaml
name: windoor-config-db
type: postgresql
plan: free
region: frankfurt
```

## 🔧 Zmienne Środowiskowe

### Backend (automatycznie ustawiane)
- `PYTHON_VERSION=3.11.8`
- `ENVIRONMENT=production`
- `SECRET_KEY` (auto-generated)
- `DATABASE_URL` (auto-connected)
- `BACKEND_CORS_ORIGINS`

### Frontend (automatycznie ustawiane)
- `NODE_VERSION=18`
- `VITE_API_URL`
- `VITE_ENVIRONMENT=production`

## 🛡️ Bezpieczeństwo

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Cache-Control dla assets

### CORS Configuration
- Production: Restricted do frontend URL
- Development: Localhost only

## 📊 Monitoring

### Health Checks
- Backend: `/api/health`
- Frontend: Root path availability
- Database: PostgreSQL connection

### Logs
- Backend logs w Render dashboard
- Frontend build logs
- Database connection logs

## 🔗 URLs Po Deployment

### Production
- **Frontend**: https://windoor-config-frontend.onrender.com
- **Backend**: https://windoor-config-backend.onrender.com
- **API Health**: https://windoor-config-backend.onrender.com/api/health
- **API Docs**: https://windoor-config-backend.onrender.com/docs

### Development
- **Frontend**: http://localhost:5000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🚀 Automatyczny Deployment

### Git Workflow
1. **Development**: Praca lokalna
2. **Testing**: `./deploy-render.sh` sprawdza gotowość
3. **Push**: Automatyczny deployment na Render
4. **Monitoring**: Health checks i logs

### CI/CD Features
- Auto-deploy przy GitHub push
- Build validation
- Health monitoring
- Rollback capability

## 🛠️ Rozwiązywanie Problemów

### Backend nie startuje
```bash
# Sprawdź logs w Render dashboard
# Najczęściej problem z DATABASE_URL lub SECRET_KEY
```

### Frontend nie łączy się z API
- Sprawdź `VITE_API_URL` w zmiennych środowiskowych
- Upewnij się, że backend działa na `/api/health`

### 404 na routach React
- Plik `_redirects` jest automatycznie kopiowany
- Render obsługuje SPA routing

### Database connection errors
- Sprawdź `DATABASE_URL` w backend service
- Upewnij się, że database service jest uruchomiony

## 📝 Przydatne Komendy

### Lokalny Development
```bash
# Setup
./start.sh

# Frontend
cd frontend && npm run dev

# Backend
cd backend && uvicorn app.main:app --reload
```

### Deployment
```bash
# Sprawdź gotowość
./deploy-render.sh

# Lub manualnie
git add .
git commit -m "Update for deployment"
git push origin main
```

### Monitoring
```bash
# Sprawdź status
./start.sh (opcja 3)

# Cleanup
./start.sh (opcja 4)
```

## 🎉 Gotowe!

Po deploymentu będziesz mieć w pełni funkcjonalną aplikację na Render.com z:
- ✅ Automatycznym deploymentem
- ✅ SSL certificates
- ✅ Database persistence
- ✅ Health monitoring
- ✅ Auto-restart przy awariach

**Render robi wszystko automatycznie!** 🚀