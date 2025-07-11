#!/bin/bash

# Windoor Config System - Quick Start Script
# This script provides a quick way to start the entire application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Windoor Config System - Quick Start${NC}"
echo -e "${BLUE}====================================${NC}"

# Function to show menu
show_menu() {
    echo -e "${YELLOW}Choose an option:${NC}"
    echo -e "1. 🛠️  Manual Development Setup"
    echo -e "2. 🌐 Deploy to Render.com"
    echo -e "3. 📋 Show Status"
    echo -e "4. 🧹 Clean Up"
    echo -e "5. 📖 Show Documentation"
    echo -e "6. ❌ Exit"
    echo ""
    read -p "Enter your choice (1-6): " choice
}

# Function for manual setup
manual_setup() {
    echo -e "${YELLOW}🛠️  Manual Development Setup...${NC}"
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not installed. Please install Node.js 18+${NC}"
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        echo -e "${RED}❌ Python3 not installed. Please install Python 3.11+${NC}"
        exit 1
    fi
    
    # Install frontend dependencies
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    pip install -r requirements.txt
    cd ..
    
    echo -e "${GREEN}✅ Setup complete!${NC}"
    echo -e "${BLUE}📝 To start development servers:${NC}"
    echo -e "Frontend: cd frontend && npm run dev"
    echo -e "Backend: cd backend && uvicorn app.main:app --reload"
}

# Function to deploy to Render
deploy_render() {
    echo -e "${YELLOW}🌐 Deploying to Render.com...${NC}"
    ./deploy-render.sh
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Checking system status...${NC}"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ Node.js: Not installed${NC}"
    fi
    
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 -V)
        echo -e "${GREEN}✅ Python: $PYTHON_VERSION${NC}"
    else
        echo -e "${RED}❌ Python: Not installed${NC}"
    fi
    
    if [ -f "render.yaml" ]; then
        echo -e "${GREEN}✅ Render config: Ready${NC}"
    else
        echo -e "${RED}❌ Render config: Missing${NC}"
    fi
    
    if [ -f "deploy-render.sh" ]; then
        echo -e "${GREEN}✅ Deploy script: Ready${NC}"
    else
        echo -e "${RED}❌ Deploy script: Missing${NC}"
    fi
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Remove node_modules
    if [ -d "frontend/node_modules" ]; then
        echo -e "${YELLOW}🗑️  Removing frontend/node_modules...${NC}"
        rm -rf frontend/node_modules
    fi
    
    # Remove dist
    if [ -d "frontend/dist" ]; then
        echo -e "${YELLOW}🗑️  Removing frontend/dist...${NC}"
        rm -rf frontend/dist
    fi
    
    # Remove __pycache__
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    echo -e "${GREEN}✅ Cleanup complete.${NC}"
}

# Function to show documentation
show_docs() {
    echo -e "${YELLOW}📖 Documentation Links:${NC}"
    echo ""
    echo -e "${BLUE}📋 Project Documentation:${NC}"
    echo -e "• README.md - Main project documentation"
    echo -e "• QUICK_START.md - Quick start guide"
    echo ""
    echo -e "${BLUE}🔗 Service URLs (when running):${NC}"
    echo -e "• Frontend: http://localhost:5000"
    echo -e "• Backend: http://localhost:8000"
    echo -e "• API Docs: http://localhost:8000/docs"
    echo ""
    echo -e "${BLUE}🚀 Deployment:${NC}"
    echo -e "• ./deploy-render.sh - Deploy to Render.com"
    echo -e "• render.yaml - Render configuration"
    echo ""
}

# Main loop
while true; do
    show_menu
    
    case $choice in
        1)
            manual_setup
            ;;
        2)
            deploy_render
            ;;
        3)
            show_status
            ;;
        4)
            clean_up
            ;;
        5)
            show_docs
            ;;
        6)
            echo -e "${GREEN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    echo ""
done