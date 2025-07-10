# WindoorConfig - Free Development & Hosting Guide

## Project Overview

**WindoorConfig** is a professional Single Page Application (SPA) for creating, configuring, and generating PDF offers for window and door companies. 

### Technology Stack:
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **PDF Generation**: Jinja2 + WeasyPrint
- **Authentication**: JWT tokens

## Current Project Structure

```
workspace/
├── frontend/          # React frontend application
├── backend/           # FastAPI backend application
├── requirements.txt   # Python dependencies (root level)
├── package.json      # Node.js dependencies (root level)
├── render.yaml       # Render.com deployment config
├── Procfile          # Heroku deployment config
├── .replit           # Replit configuration
└── main.py           # Replit entry point
```

## Free Development Setup

### Prerequisites
1. **Node.js** (v16+) and npm
2. **Python** (3.8+)
3. **Git**
4. **PostgreSQL** (local or cloud)

### Local Development Steps

#### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5000`

#### 2. Backend Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
The backend API will run on `http://localhost:8000`

#### 3. Database Setup
You'll need to configure PostgreSQL. The connection is defined in `backend/app/config.py`.

## Free Hosting Options

### Option 1: Render.com (Recommended) ⭐

**Cost**: Free tier available
**Pros**: 
- Already configured (`render.yaml` exists)
- PostgreSQL database included
- Automatic deployments from Git
- SSL certificates included

**Setup Steps**:
1. Create account at [render.com](https://render.com)
2. Connect your GitHub repository
3. The `render.yaml` file will automatically configure:
   - Web service for the backend
   - PostgreSQL database
4. **Required Changes**:
   - Update `render.yaml` to include frontend build and serve
   - Add environment variables for database connection
   - Modify static file serving in FastAPI

**Current render.yaml needs modification**:
```yaml
services:
  - type: web
    name: windoor-backend
    env: python
    plan: free
    buildCommand: "pip install -r requirements.txt && cd frontend && npm install && npm run build"
    startCommand: "uvicorn backend.app.main:app --host 0.0.0.0 --port 10000"
    staticPublishPath: "./frontend/dist"
    
databases:
  - name: windoor-db
    databaseName: windoor
    user: windoor
    plan: free
```

### Option 2: Railway.app

**Cost**: Free tier with $5 monthly credit
**Pros**: 
- Simple deployment
- PostgreSQL included
- Good performance

**Setup Steps**:
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL service
4. Deploy both frontend and backend

### Option 3: Vercel + Supabase

**Cost**: Free
**Pros**:
- Excellent frontend hosting (Vercel)
- Free PostgreSQL (Supabase)
- Great developer experience

**Setup Steps**:
1. **Frontend on Vercel**:
   - Deploy `frontend/` directory to Vercel
   - Automatic builds from Git

2. **Backend on Vercel** (Serverless):
   - Adapt FastAPI to work with Vercel serverless functions
   - Create `api/` directory with serverless endpoints

3. **Database on Supabase**:
   - Create free PostgreSQL database
   - Update connection strings

### Option 4: Heroku (Limited Free Option)

**Note**: Heroku removed free tier, but has low-cost options ($5-7/month)
**Pros**: 
- `Procfile` already exists
- Easy deployment

## Required Changes for Free Hosting

### 1. Fix Frontend Build Configuration

**Current Issue**: The root `package.json` doesn't have proper build scripts.

**Solution**: Update root `package.json`:
```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "start": "uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### 2. Update FastAPI to Serve Frontend

**File**: `backend/app/main.py`

**Add static file serving**:
```python
from fastapi.staticfiles import StaticFiles

# Add after creating FastAPI app
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")
```

### 3. Environment Configuration

**Create `.env` file** (don't commit this):
```env
DATABASE_URL=postgresql://username:password@hostname:port/database
JWT_SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:5000
```

**Update `backend/app/config.py`** to use environment variables properly.

### 4. Update Frontend API Base URL

**File**: `frontend/src/config.ts` (create if doesn't exist):
```typescript
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com' 
  : 'http://localhost:8000';
```

### 5. Add Missing Dependencies

**Add to `requirements.txt`**:
```txt
weasyprint
passlib[bcrypt]
python-multipart
```

**Add to `frontend/package.json` devDependencies**:
```json
"@types/node": "^18.0.0"
```

## Database Migration

### For PostgreSQL hosting:
1. **Supabase**: Free 500MB PostgreSQL
2. **Neon**: Free PostgreSQL with generous limits
3. **Render**: Free PostgreSQL (limited)

### Required Database Setup:
1. Create tables (you may need to add migration scripts)
2. Seed initial data
3. Configure connection pooling for production

## Deployment Checklist

### Before Deploying:
- [ ] Add environment variables to hosting platform
- [ ] Update CORS settings in FastAPI
- [ ] Configure database connection
- [ ] Update frontend API URLs
- [ ] Add production build scripts
- [ ] Test PDF generation with production fonts
- [ ] Set up proper error handling
- [ ] Configure logging

### Production Environment Variables:
```env
DATABASE_URL=postgresql://...
JWT_SECRET_KEY=random-secret-key
CORS_ORIGINS=["https://yourdomain.com"]
DEBUG=False
```

## Estimated Costs

| Option | Monthly Cost | Database | Bandwidth | Notes |
|--------|-------------|----------|-----------|-------|
| Render.com | Free | 1GB PostgreSQL | 100GB | Best for MVP |
| Railway | $5 credit | Included | Good | Pay-as-you-use |
| Vercel + Supabase | Free | 500MB | 100GB | Great performance |
| Heroku | $7 | Extra $5 | Limited | Most reliable |

## Recommendations

### For MVP/Testing:
**Use Render.com** - It's the easiest setup with your current configuration.

### For Production:
**Use Vercel + Supabase** - Better performance and scalability.

### Next Steps:
1. Fix the configuration issues mentioned above
2. Set up a free PostgreSQL database
3. Deploy to Render.com using the updated `render.yaml`
4. Test all functionality including PDF generation
5. Set up monitoring and error tracking (Sentry has a free tier)

## Additional Free Tools
- **Monitoring**: Sentry (free tier)
- **Analytics**: Google Analytics
- **CDN**: Cloudflare (free)
- **Domain**: Freenom (free domains) or use subdomain from hosting provider
- **SSL**: Included with most hosting providers
- **Email**: EmailJS (free tier) for contact forms