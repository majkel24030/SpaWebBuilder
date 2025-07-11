# ⚡ Quick Start Guide

Get **Windoor Config System** up and running in minutes!

## 🚀 One-Command Start

```bash
# Interactive setup menu
./start.sh
```

## 🐳 Docker (Recommended)

```bash
# 1. Setup environment
cp .env.example .env
# Edit .env with your values

# 2. Start everything
./docker-local.sh start

# 3. Open application
open http://localhost:3000
```

## �️ Manual Development

```bash
# 1. Install dependencies
cd frontend && npm install && cd ..
cd backend && pip install -r requirements.txt && cd ..

# 2. Start services
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend  
cd backend && uvicorn app.main:app --reload
```

## 🌐 Deploy to Production

```bash
# Automated deployment to Render.com
./deploy-render.sh
```

## 📋 Service URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Database**: localhost:5432

## 🆘 Need Help?

Run `./start.sh` and choose option 7 for documentation links.

---

**That's it! 🎉** Your Windoor Config System is ready to use.