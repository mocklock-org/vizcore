#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Starting VizCore local development environment...${NC}"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ docker is not installed${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ docker-compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose down --remove-orphans

echo -e "${YELLOW}🔨 Building and starting services...${NC}"
docker-compose up --build -d

echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

echo -e "${GREEN}📊 Service status:${NC}"
docker-compose ps

echo -e "${YELLOW}📝 Recent logs:${NC}"
docker-compose logs --tail=20

echo -e "${GREEN}🎉 Local development environment is ready!${NC}"
echo -e "${YELLOW}📍 VizCore is running at: http://localhost:3000${NC}"
echo -e "${YELLOW}💡 To view logs: docker-compose logs -f${NC}"
echo -e "${YELLOW}🛑 To stop: docker-compose down${NC}"
