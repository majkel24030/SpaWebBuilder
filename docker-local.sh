#!/bin/bash

# Windoor Config System - Local Docker Testing Script
# This script helps you test the application locally with Docker Compose

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Windoor Config System - Local Docker Testing${NC}"
echo -e "${BLUE}================================================${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your preferred values.${NC}"
fi

# Function to show help
show_help() {
    echo -e "${BLUE}Usage: $0 [COMMAND]${NC}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  start       Start all services"
    echo -e "  stop        Stop all services"
    echo -e "  restart     Restart all services"
    echo -e "  logs        Show logs for all services"
    echo -e "  build       Build all images"
    echo -e "  clean       Clean up containers and images"
    echo -e "  status      Show status of all services"
    echo -e "  shell       Open shell in backend container"
    echo -e "  test        Run tests"
    echo -e "  help        Show this help message"
}

# Function to start services
start_services() {
    echo -e "${YELLOW}🚀 Starting all services...${NC}"
    docker-compose up -d
    
    echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
    sleep 10
    
    echo -e "${GREEN}✅ Services started successfully!${NC}"
    echo -e "${BLUE}📝 Service URLs:${NC}"
    echo -e "• Application: http://localhost:3000"
    echo -e "• Backend API: http://localhost:8000"
    echo -e "• API Health: http://localhost:8000/api/health"
    echo -e "• API Docs: http://localhost:8000/docs"
    echo -e "• PostgreSQL: localhost:5432"
    echo -e "• Nginx Proxy: http://localhost:80"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Services stopped successfully!${NC}"
}

# Function to restart services
restart_services() {
    echo -e "${YELLOW}🔄 Restarting all services...${NC}"
    docker-compose down
    docker-compose up -d
    echo -e "${GREEN}✅ Services restarted successfully!${NC}"
}

# Function to show logs
show_logs() {
    echo -e "${YELLOW}📋 Showing logs for all services...${NC}"
    docker-compose logs -f
}

# Function to build images
build_images() {
    echo -e "${YELLOW}🏗️  Building all images...${NC}"
    docker-compose build --no-cache
    echo -e "${GREEN}✅ Images built successfully!${NC}"
}

# Function to clean up
clean_up() {
    echo -e "${YELLOW}🧹 Cleaning up containers and images...${NC}"
    docker-compose down -v --rmi all
    docker system prune -f
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

# Function to show status
show_status() {
    echo -e "${YELLOW}📊 Service Status:${NC}"
    docker-compose ps
    echo ""
    echo -e "${YELLOW}🔍 Health Checks:${NC}"
    
    # Check backend health
    if curl -f http://localhost:8000/api/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend: Healthy${NC}"
    else
        echo -e "${RED}❌ Backend: Unhealthy${NC}"
    fi
    
    # Check frontend
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend: Healthy${NC}"
    else
        echo -e "${RED}❌ Frontend: Unhealthy${NC}"
    fi
    
    # Check database
    if docker-compose exec -T postgres pg_isready -U windoor_user >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Database: Healthy${NC}"
    else
        echo -e "${RED}❌ Database: Unhealthy${NC}"
    fi
}

# Function to open shell in backend container
open_shell() {
    echo -e "${YELLOW}🐚 Opening shell in backend container...${NC}"
    docker-compose exec backend /bin/bash
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    docker-compose exec backend python -m pytest
}

# Main command handling
case "${1:-start}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs
        ;;
    build)
        build_images
        ;;
    clean)
        clean_up
        ;;
    status)
        show_status
        ;;
    shell)
        open_shell
        ;;
    test)
        run_tests
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac