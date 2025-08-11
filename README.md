# VizCore

**A high-performance data visualization framework that solves enterprise data challenges.**

## About VizCore

VizCore emerged from our initial work on **PaulJS**, a web framework project. As we witnessed the rapid scaling capabilities that AI brought to modern development, we realized that launching traditional landing pages had become easier. Instead, we focused on creating VizCore (Visualization Core) - a high-performance data visualization framework that solves enterprise data challenges.

Our focus is on helping companies get full insights on their data, whether working with AWS DB, Azure, SQL, PostgreSQL, MongoDB, Firebase, or any other database.

This is the initial development stage. Stay tuned as we will launch the official first beta soon.

## Development Commands

```bash
# Build all packages
npm run build

# Run tests
npm run test

# Start development mode
npm run dev

# Clean dependencies
npm run clean
```

## Lerna Commands

```bash
# Build all packages
lerna run build

# Test all packages
lerna run test

# Run dev in parallel
lerna run dev --parallel

# Clean all node_modules
lerna clean

# Publish packages
lerna publish
```

## Docker Commands

```bash
# Build Docker image
docker build -t vizcore:latest .

# Run with Docker Compose (local development)
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Start local development environment (using helper script)
bash scripts/local-dev.sh
```

## Kubernetes Commands

```bash
# Deploy to Kubernetes cluster
kubectl apply -k k8s/

# Deploy using helper script
bash scripts/deploy.sh

# Check deployment status
kubectl get pods -n vizcore
kubectl get services -n vizcore

# View logs
kubectl logs -l app=vizcore -n vizcore

# Scale deployment
kubectl scale deployment vizcore-app --replicas=5 -n vizcore

# Delete deployment
kubectl delete -k k8s/

# Port forward for local access
kubectl port-forward service/vizcore-service 3000:80 -n vizcore
```

## Environment Variables

```bash
# Docker/Kubernetes environment variables
NODE_ENV=production
LOG_LEVEL=info
MEMORY_THRESHOLD=80
PERFORMANCE_MONITORING=true
```