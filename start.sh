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
    echo -e "1. 🐳 Start with Docker (Recommended)"
    echo -e "2. 🛠️  Manual Development Setup"
    echo -e "3. 🌐 Deploy to Render.com"
    echo -e "4. 📋 Show Status"
    echo -e "5. 🛑 Stop All Services"
    echo -e "6. 🧹 Clean Up"
    echo -e "7. 📖 Show Documentation"
    echo -e "8. ❌ Exit"
    echo ""
    read -p "Enter your choice (1-8): " choice
}

# Function to start with Docker
start_docker() {
    echo -e "${YELLOW}🐳 Starting with Docker...${NC}"
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker not installed. Please install Docker first.${NC}"
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}📋 Creating .env file...${NC}"
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please edit it with your configuration.${NC}"
    fi
    
    # Start services
    ./docker-local.sh start
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
    
    # Setup environment
    if [ ! -f ".env" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created. Please edit it with your configuration.${NC}"
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
    
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✅ Docker: Installed${NC}"
        ./docker-local.sh status
    else
        echo -e "${RED}❌ Docker: Not installed${NC}"
    fi
    
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
    
    if [ -f ".env" ]; then
        echo -e "${GREEN}✅ Environment: Configured${NC}"
    else
        echo -e "${YELLOW}⚠️  Environment: Not configured${NC}"
    fi
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    if command -v docker &> /dev/null; then
        ./docker-local.sh stop
    fi
    
    # Kill any running Node.js processes
    pkill -f "npm run dev" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    # Kill any running Python processes
    pkill -f "uvicorn" 2>/dev/null || true
    pkill -f "fastapi" 2>/dev/null || true
    
    echo -e "${GREEN}✅ All services stopped.${NC}"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up...${NC}"
    
    # Stop services first
    stop_services
    
    # Docker cleanup
    if command -v docker &> /dev/null; then
        ./docker-local.sh clean
    fi
    
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
    echo -e "• RENDER_DEPLOYMENT_BLUEPRINT.md - Complete deployment guide"
    echo -e "• INSTRUKCJE_RENDER_DEPLOYMENT.md - Render.com instructions"
    echo ""
    echo -e "${BLUE}🔗 Service URLs (when running):${NC}"
    echo -e "• Frontend: http://localhost:3000"
    echo -e "• Backend: http://localhost:8000"
    echo -e "• API Docs: http://localhost:8000/docs"
    echo -e "• Database: localhost:5432"
    echo ""
    echo -e "${BLUE}🐳 Docker Commands:${NC}"
    echo -e "• ./docker-local.sh start - Start all services"
    echo -e "• ./docker-local.sh status - Check service status"
    echo -e "• ./docker-local.sh logs - View logs"
    echo -e "• ./docker-local.sh stop - Stop services"
    echo ""
    echo -e "${BLUE}🚀 Deployment:${NC}"
    echo -e "• ./deploy-render.sh - Deploy to Render.com"
}

# Main menu loop
while true; do
    show_menu
    
    case $choice in
        1)
            start_docker
            ;;
        2)
            manual_setup
            ;;
        3)
            deploy_render
            ;;
        4)
            show_status
            ;;
        5)
            stop_services
            ;;
        6)
            clean_up
            ;;
        7)
            show_docs
            ;;
        8)
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