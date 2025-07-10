#!/bin/bash

# Deploy script for Render.com
# This script helps prepare the project for deployment

echo "🚀 Przygotowywanie deploymentu na Render.com..."

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Git repository zawiera niezacommitowane zmiany!"
    echo "Proszę zcommitować wszystkie zmiany przed deploymentem."
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo "❌ Brak pliku render.yaml!"
    exit 1
fi

# Check if _redirects exists
if [ ! -f "frontend/public/_redirects" ]; then
    echo "❌ Brak pliku frontend/public/_redirects!"
    exit 1
fi

# Validate package.json
if [ ! -f "frontend/package.json" ]; then
    echo "❌ Brak pliku frontend/package.json!"
    exit 1
fi

# Validate requirements.txt
if [ ! -f "backend/requirements.txt" ]; then
    echo "❌ Brak pliku backend/requirements.txt!"
    exit 1
fi

echo "✅ Wszystkie pliki konfiguracyjne są gotowe!"
echo ""
echo "📋 Następne kroki:"
echo "1. Upewnij się, że kod jest na GitHub"
echo "2. Zaloguj się na render.com"
echo "3. Kliknij 'New +' → 'Blueprint'"
echo "4. Wybierz to repozytorium"
echo "5. Render automatycznie wykryje render.yaml i utworzy wszystkie serwisy"
echo ""
echo "🔗 Po deploymencie sprawdź:"
echo "   - Backend: https://windoor-config-backend.onrender.com/api/health"
echo "   - Frontend: https://windoor-config-frontend.onrender.com"
echo ""
echo "✨ Deployment gotowy do uruchomienia!"

# Optional: push to git if user wants
read -p "Czy chcesz wypchnąć zmiany na GitHub? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Pushing to GitHub..."
    git add .
    git commit -m "Przygotowanie do deploymentu na Render.com"
    git push
    echo "✅ Zmiany zostały wypchnięte na GitHub!"
fi