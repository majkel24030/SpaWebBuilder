#!/bin/bash

# Windoor Config System - Deployment Test Script
# This script tests if everything is ready for Render deployment

# set -e  # Commented out to see all test results

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Windoor Config System - Deployment Test${NC}"
echo -e "${BLUE}===========================================${NC}"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if render.yaml exists
run_test "render.yaml exists" "[ -f 'render.yaml' ]"

# Test 2: Check if deploy script exists
run_test "deploy-render.sh exists" "[ -f 'deploy-render.sh' ]"

# Test 3: Check if start script exists
run_test "start.sh exists" "[ -f 'start.sh' ]"

# Test 4: Check if backend requirements exist
run_test "backend/requirements.txt exists" "[ -f 'backend/requirements.txt' ]"

# Test 5: Check if frontend package.json exists
run_test "frontend/package.json exists" "[ -f 'frontend/package.json' ]"

# Test 6: Check if CSV file exists
run_test "Rozszerzona_tabela_opcji.csv exists" "[ -f 'Rozszerzona_tabela_opcji.csv' ]"

# Test 7: Check if _redirects exists
run_test "frontend/public/_redirects exists" "[ -f 'frontend/public/_redirects' ]"

# Test 8: Check if .env.example exists
run_test ".env.example exists" "[ -f '.env.example' ]"

# Test 9: Check if scripts are executable
run_test "deploy-render.sh is executable" "[ -x 'deploy-render.sh' ]"
run_test "start.sh is executable" "[ -x 'start.sh' ]"

# Test 10: Validate render.yaml syntax
run_test "render.yaml syntax is valid" "python3 -c \"import yaml; yaml.safe_load(open('render.yaml'))\""

# Test 11: Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo -e "${GREEN}✅ PASS: Node.js version >= 18${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: Node.js version < 18 (found: $NODE_VERSION)${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL: Node.js not installed${NC}"
    ((TESTS_FAILED++))
fi

# Test 12: Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 -V 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    if [ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -ge 11 ]; then
        echo -e "${GREEN}✅ PASS: Python version >= 3.11${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: Python version < 3.11 (found: $PYTHON_VERSION)${NC}"
        ((TESTS_FAILED++))
    fi
else
    echo -e "${RED}❌ FAIL: Python3 not installed${NC}"
    ((TESTS_FAILED++))
fi

# Test 13: Test frontend build
echo -e "${YELLOW}Testing: Frontend build${NC}"
cd frontend
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Frontend build successful${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Frontend build failed${NC}"
    ((TESTS_FAILED++))
fi
cd ..

# Test 14: Test backend dependencies
echo -e "${YELLOW}Testing: Backend dependencies${NC}"
cd backend
if pip install -r requirements.txt --dry-run --break-system-packages >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS: Backend dependencies valid${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAIL: Backend dependencies invalid${NC}"
    ((TESTS_FAILED++))
fi
cd ..

# Test 15: Check git status
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ PASS: Git working directory is clean${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING: Git working directory is not clean${NC}"
    echo -e "${YELLOW}   This is okay for testing but commit changes before deployment${NC}"
    ((TESTS_PASSED++))
fi

# Summary
echo ""
echo -e "${BLUE}📊 Test Summary:${NC}"
echo -e "${GREEN}✅ Tests passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All tests passed! Your project is ready for Render deployment!${NC}"
    echo ""
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo -e "1. Run: ./deploy-render.sh"
    echo -e "2. Go to https://render.com"
    echo -e "3. Click 'New +' → 'Blueprint'"
    echo -e "4. Connect your GitHub repository"
    echo -e "5. Render will automatically deploy everything!"
    echo ""
    echo -e "${GREEN}🚀 Ready to deploy!${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed. Please fix the issues before deployment.${NC}"
    echo ""
    echo -e "${YELLOW}Common fixes:${NC}"
    echo -e "• Install Node.js 18+: https://nodejs.org/"
    echo -e "• Install Python 3.11+: https://python.org/"
    echo -e "• Fix frontend build errors"
    echo -e "• Fix backend dependency issues"
    echo -e "• Commit git changes"
    echo ""
    echo -e "${RED}Please fix the failed tests and run this script again.${NC}"
fi