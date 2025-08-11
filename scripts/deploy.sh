#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

NAMESPACE=${NAMESPACE:-vizcore}
IMAGE_TAG=${IMAGE_TAG:-latest}
REGISTRY=${REGISTRY:-ghcr.io}
REPO_NAME=${REPO_NAME:-vizcore}

echo -e "${GREEN}🚀 Starting VizCore deployment...${NC}"

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command_exists kubectl; then
    echo -e "${RED}❌ kubectl is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}❌ docker is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo -e "${YELLOW}🔨 Building Docker image...${NC}"
docker build -t ${REGISTRY}/${REPO_NAME}:${IMAGE_TAG} .

echo -e "${YELLOW}📤 Pushing to registry...${NC}"
docker push ${REGISTRY}/${REPO_NAME}:${IMAGE_TAG}

echo -e "${YELLOW}☸️  Applying Kubernetes manifests...${NC}"

kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -k k8s/ -n ${NAMESPACE}

echo -e "${YELLOW}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/vizcore-app -n ${NAMESPACE} --timeout=300s

echo -e "${GREEN}📊 Deployment completed successfully!${NC}"
echo -e "${YELLOW}Service information:${NC}"
kubectl get services -n ${NAMESPACE}

echo -e "${YELLOW}Pod status:${NC}"
kubectl get pods -n ${NAMESPACE}

if kubectl get ingress -n ${NAMESPACE} >/dev/null 2>&1; then
    echo -e "${YELLOW}Ingress information:${NC}"
    kubectl get ingress -n ${NAMESPACE}
fi

echo -e "${GREEN}🎉 VizCore deployment completed!${NC}"
