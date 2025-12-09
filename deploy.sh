#!/bin/bash

# Deployment Script for Next.js with Python Scripts
# This script helps automate the deployment process on a VPS

set -e  # Exit on error

echo "=========================================="
echo "  Next.js + Python Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root${NC}"
   exit 1
fi

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node --version) found${NC}"

# Check Python
echo -e "${YELLOW}Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version) found${NC}"

# Check if we're in the project directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Step 1: Install/Update Node.js dependencies
echo ""
echo -e "${YELLOW}Step 1: Installing Node.js dependencies...${NC}"
if command -v pnpm &> /dev/null; then
    echo "Using pnpm..."
    pnpm install
else
    echo "Using npm..."
    npm install
fi
echo -e "${GREEN}✓ Node.js dependencies installed${NC}"

# Step 2: Set up Python virtual environment
echo ""
echo -e "${YELLOW}Step 2: Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓ Virtual environment created${NC}"
else
    echo -e "${GREEN}✓ Virtual environment already exists${NC}"
fi

# Step 3: Install Python dependencies
echo ""
echo -e "${YELLOW}Step 3: Installing Python dependencies...${NC}"
source venv/bin/activate
if [ -f "requirements.txt" ]; then
    pip install --upgrade pip
    pip install -r requirements.txt
    echo -e "${GREEN}✓ Python dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ requirements.txt not found. Skipping Python dependencies.${NC}"
fi
deactivate

# Step 4: Build Next.js application
echo ""
echo -e "${YELLOW}Step 4: Building Next.js application...${NC}"
if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi
echo -e "${GREEN}✓ Application built successfully${NC}"

# Step 5: Check PM2
echo ""
echo -e "${YELLOW}Step 5: Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}PM2 is not installed. Installing...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 installed${NC}"
else
    echo -e "${GREEN}✓ PM2 is installed${NC}"
fi

# Step 6: Restart application with PM2
echo ""
echo -e "${YELLOW}Step 6: Restarting application with PM2...${NC}"
APP_NAME="worklytics-hrms"

# Check if app is already running
if pm2 list | grep -q "$APP_NAME"; then
    echo "Restarting existing PM2 process..."
    pm2 restart "$APP_NAME"
else
    echo "Starting new PM2 process..."
    if command -v pnpm &> /dev/null; then
        pm2 start pnpm --name "$APP_NAME" -- start
    else
        pm2 start npm --name "$APP_NAME" -- start
    fi
    pm2 save
fi

echo ""
echo -e "${GREEN}=========================================="
echo -e "  Deployment Complete!"
echo -e "==========================================${NC}"
echo ""
echo "Application Status:"
pm2 status "$APP_NAME"
echo ""
echo "View logs with: pm2 logs $APP_NAME"
echo "Monitor with: pm2 monit"
echo ""

