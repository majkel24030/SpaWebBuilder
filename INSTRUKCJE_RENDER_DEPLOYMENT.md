# Instrukcje Deployment na Render.com - Krok po Kroku

## Przegląd Projektu
Aplikacja **Windoor Config System** to fullstack SPA (Single Page Application) składająca się z:
- **Backend**: FastAPI (Python) z PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Funkcjonalność**: System konfiguracji okien/drzwi z generowaniem ofert PDF

---

## 1. Przygotowanie Konta Render.com

### Krok 1.1: Rejestracja
1. Przejdź na [render.com](https://render.com)
2. Zarejestruj się używając GitHub, GitLab lub email
3. Połącz swoje konto z GitHub (zalecane)

### Krok 1.2: Przygotowanie Repozytorium
1. Upewnij się, że kod jest w repozytorium GitHub
2. Wszystkie pliki muszą być commitowane i pushowane
3. Repozytorium może być prywatne lub publiczne

---

## 2. Konfiguracja Bazy Danych PostgreSQL

### Krok 2.1: Utworzenie Bazy Danych
1. Na dashboard Render.com kliknij **"New +"**
2. Wybierz **"PostgreSQL"**
3. Wypełnij dane:
   - **Name**: `windoor-config-db`
   - **Database**: `windoor_config`
   - **User**: `windoor_user` (lub domyślne)
   - **Region**: `Frankfurt` (dla lepszej lokalizacji)
   - **Plan**: `Free` (dla testów) lub `Starter`
4. Kliknij **"Create Database"**

### Krok 2.2: Zapisanie Danych Połączenia
Po utworzeniu bazy danych **zapisz**:
- **Internal Database URL** (do backend serwisu)
- **External Database URL** (do zewnętrznych narzędzi)
- **Hostname**, **Port**, **Database**, **Username**, **Password**

⚠️ **WAŻNE**: Te dane będą potrzebne w konfiguracji backendu!

---

## 3. Deployment Backendu (FastAPI)

### Krok 3.1: Utworzenie Web Service
1. Na dashboard kliknij **"New +"**
2. Wybierz **"Web Service"**
3. Połącz z repozytorium GitHub
4. Wybierz branch (np. `main` lub `master`)

### Krok 3.2: Konfiguracja Serwisu
```yaml
# Podstawowe ustawienia
Name: windoor-config-backend
Environment: Python 3
Region: Frankfurt
Branch: main
Root Directory: (pozostaw puste - używa głównego katalogu)

# Komendy
Build Command: pip install -r requirements.txt
Start Command: uvicorn backend.app.main:app --host 0.0.0.0 --port 10000
```

### Krok 3.3: Zmienne Środowiskowe
Dodaj następujące zmienne środowiskowe w sekcji **"Environment Variables"**:

```env
# Python
PYTHON_VERSION=3.11

# Database (użyj Internal Database URL z kroku 2.2)
DATABASE_URL=postgresql://user:password@hostname:port/database_name

# FastAPI
BACKEND_CORS_ORIGINS=["*"]

# Security (wygeneruj silne hasła)
SECRET_KEY=your-secret-key-here-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=production
```

### Krok 3.4: Zaawansowane Ustawienia
```yaml
Plan: Free (dla testów) lub Starter
Auto Deploy: Yes (automatyczny deployment przy push)
```

### Krok 3.5: Deploy
1. Kliknij **"Create Web Service"**
2. Poczekaj na build (5-10 minut)
3. Sprawdź logs czy nie ma błędów
4. Test endpoint: `https://your-backend-url.onrender.com/api/health`

---

## 4. Deployment Frontendu (React SPA)

### Krok 4.1: Przygotowanie Build Script
W `frontend/package.json` upewnij się, że masz:
```json
{
  "scripts": {
    "build": "tsc && vite build && cp src/fix-pdf-download.js dist/assets/"
  }
}
```

### Krok 4.2: Utworzenie Static Site
1. Na dashboard kliknij **"New +"**
2. Wybierz **"Static Site"**
3. Połącz z tym samym repozytorium GitHub

### Krok 4.3: Konfiguracja Static Site
```yaml
Name: windoor-config-frontend
Branch: main
Root Directory: frontend
Build Command: npm install && npm run build
Publish Directory: dist
```

### Krok 4.4: Zmienne Środowiskowe Frontend
```env
# Vite Environment Variables (prefiks VITE_ jest wymagany)
VITE_API_URL=https://your-backend-url.onrender.com/api
VITE_ENVIRONMENT=production

# Node.js
NODE_VERSION=18
```

### Krok 4.5: Konfiguracja Redirects
W katalogu `frontend/dist` (lub dodaj do build procesu) utwórz plik `_redirects`:
```
# SPA Routing - wszystkie ścieżki przekierowane na index.html
/*    /index.html   200
```

### Krok 4.6: Deploy Frontend
1. Kliknij **"Create Static Site"**
2. Poczekaj na build
3. Sprawdź czy strona działa pod przydzielonym URL

---

## 5. Konfiguracja Custom Domain (Opcjonalne)

### Krok 5.1: Dodanie Domeny do Backend
1. W ustawieniach backend serwisu kliknij **"Custom Domains"**
2. Dodaj subdomenę: `api.yourdomain.com`
3. Skonfiguruj CNAME rekord w DNS

### Krok 5.2: Dodanie Domeny do Frontend
1. W ustawieniach frontend serwisu kliknij **"Custom Domains"**
2. Dodaj domenę główną: `yourdomain.com`
3. Skonfiguruj A rekord lub CNAME w DNS

### Krok 5.3: Aktualizacja CORS
Zaktualizuj `BACKEND_CORS_ORIGINS` w zmiennych środowiskowych:
```env
BACKEND_CORS_ORIGINS=["https://yourdomain.com", "https://www.yourdomain.com"]
```

---

## 6. Monitorowanie i Debugowanie

### Krok 6.1: Sprawdzenie Logów
1. **Backend logs**: W panelu backend serwisu → **"Logs"**
2. **Frontend logs**: W panelu static site → **"Deploy Logs"**

### Krok 6.2: Testowanie Endpoint-ów
```bash
# Health check
curl https://your-backend-url.onrender.com/api/health

# API docs (jeśli włączone)
https://your-backend-url.onrender.com/docs
```

### Krok 6.3: Sprawdzenie Połączenia z Bazą
W logach backendu szukaj:
```
Frontend build found at: /opt/render/project/src/frontend/dist
Database connection successful
```

---

## 7. Optymalizacje i Wskazówki

### Krok 7.1: Automatyczny Deployment
- Włącz "Auto Deploy" dla obu serwisów
- Każdy push na branch `main` automatycznie wdroży zmiany

### Krok 7.2: Monitoring Wydajności
- Render Free plan ma ograniczenia (usypianie po 15 min nieaktywności)
- Rozważ upgrade do Starter planu dla produkcji

### Krok 7.3: Backup Bazy Danych
- Render automatycznie backupuje bazy danych
- Dla krytycznych danych rozważ external backup

### Krok 7.4: SSL/HTTPS
- Render automatycznie zapewnia SSL dla wszystkich serwisów
- Certyfikaty są automatycznie odnawiane

---

## 8. Troubleshooting - Częste Problemy

### Problem: Backend nie startuje
```bash
# Sprawdź logs i poszukaj:
# 1. Błędy instalacji dependencies
# 2. Błędy połączenia z bazą danych
# 3. Nieprawidłowe zmienne środowiskowe
```

### Problem: Frontend nie łączy się z backend
```bash
# Sprawdź:
# 1. VITE_API_URL w zmiennych środowiskowych frontend
# 2. CORS konfigurację w backend
# 3. Czy backend jest dostępny
```

### Problem: Build frontend fail
```bash
# Najczęstsze przyczyny:
# 1. Błędy TypeScript
# 2. Brakujące dependencies
# 3. Nieprawidłowa ścieżka w build command
```

### Problem: 404 na routach SPA
```bash
# Rozwiązanie:
# 1. Upewnij się że _redirects file jest w dist/
# 2. Sprawdź czy routing w React jest poprawny
```

---

## 9. Checklist Końcowy

- [ ] ✅ Baza PostgreSQL utworzona i działa
- [ ] ✅ Backend serwis wdrożony i odpowiada na `/api/health`
- [ ] ✅ Frontend static site wdrożony i ładuje się
- [ ] ✅ Frontend łączy się z backend API
- [ ] ✅ Zmienne środowiskowe skonfigurowane
- [ ] ✅ Auto deployment włączony
- [ ] ✅ Custom domeny skonfigurowane (jeśli dotyczy)
- [ ] ✅ SSL certificates aktywne
- [ ] ✅ Backup bazy danych działający

---

## 10. URLs i Kontakty

Po wdrożeniu Twoje aplikacja będzie dostępna pod:
- **Frontend**: `https://your-frontend-name.onrender.com`
- **Backend API**: `https://your-backend-name.onrender.com/api`
- **API Docs**: `https://your-backend-name.onrender.com/docs`

---

**🎉 Gratulacje! Twoja aplikacja Windoor Config System jest teraz wdrożona na Render.com!**