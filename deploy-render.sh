#!/bin/bash

# Windoor Config System - Render Deployment Script
# This script automates the deployment process to Render.com

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Windoor Config System - Render Deployment Script${NC}"
echo -e "${BLUE}===================================================${NC}"

# Check if git is clean
echo -e "${YELLOW}📋 Checking git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Git working directory is not clean. Please commit your changes first.${NC}"
    git status
    exit 1
fi

# Check if render.yaml exists
if [ ! -f "render.yaml" ]; then
    echo -e "${RED}❌ render.yaml not found. Please ensure you're in the project root.${NC}"
    exit 1
fi

# Check if required files exist
echo -e "${YELLOW}📋 Checking required files...${NC}"
REQUIRED_FILES=(
    "backend/requirements.txt"
    "frontend/package.json"
    "Rozszerzona_tabela_opcji.csv"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo -e "${RED}❌ Required file missing: $file${NC}"
        exit 1
    fi
done

# Check Node.js version
echo -e "${YELLOW}📋 Checking Node.js version...${NC}"
NODE_VERSION=$(node -v 2>/dev/null || echo "not installed")
if [[ "$NODE_VERSION" == "not installed" ]]; then
    echo -e "${RED}❌ Node.js not installed. Please install Node.js 18+${NC}"
    exit 1
fi

# Check Python version
echo -e "${YELLOW}📋 Checking Python version...${NC}"
PYTHON_VERSION=$(python3 -V 2>/dev/null || echo "not installed")
if [[ "$PYTHON_VERSION" == "not installed" ]]; then
    echo -e "${RED}❌ Python3 not installed. Please install Python 3.11+${NC}"
    exit 1
fi

# Test backend dependencies
echo -e "${YELLOW}📋 Testing backend dependencies...${NC}"
cd backend
if ! pip install -r requirements.txt --dry-run >/dev/null 2>&1; then
    echo -e "${RED}❌ Backend dependencies have issues. Please check requirements.txt${NC}"
    exit 1
fi
cd ..

# Test frontend build
echo -e "${YELLOW}📋 Testing frontend build...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if ! npm run build >/dev/null 2>&1; then
    echo -e "${RED}❌ Frontend build failed. Please check for TypeScript errors.${NC}"
    exit 1
fi

# Check if dist folder was created
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Frontend build did not create dist folder.${NC}"
    exit 1
fi

cd ..

# Validate render.yaml syntax
echo -e "${YELLOW}📋 Validating render.yaml...${NC}"
if ! python3 -c "import yaml; yaml.safe_load(open('render.yaml'))" 2>/dev/null; then
    echo -e "${RED}❌ render.yaml has syntax errors.${NC}"
    exit 1
fi

# Git operations
echo -e "${YELLOW}📋 Committing changes...${NC}"
git add .
git commit -m "Prepare for Render deployment - $(date)" || echo "No changes to commit"

# Push to main branch
echo -e "${YELLOW}📋 Pushing to main branch...${NC}"
git push origin main || git push origin master

echo -e "${GREEN}✅ All checks passed!${NC}"
echo -e "${GREEN}🎉 Your project is ready for Render deployment!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo -e "1. Go to https://render.com and login"
echo -e "2. Click 'New +' and select 'Blueprint'"
echo -e "3. Connect your GitHub repository"
echo -e "4. Render will automatically detect render.yaml and deploy your services"
echo -e "5. Monitor the deployment in the Render dashboard"
echo ""
echo -e "${BLUE}🔗 Useful links after deployment:${NC}"
echo -e "• Frontend: https://windoor-config-frontend.onrender.com"
echo -e "• Backend: https://windoor-config-backend.onrender.com"
echo -e "• API Health: https://windoor-config-backend.onrender.com/api/health"
echo -e "• API Docs: https://windoor-config-backend.onrender.com/docs"
echo ""
echo -e "${GREEN}🚀 Deployment preparation complete!${NC}"