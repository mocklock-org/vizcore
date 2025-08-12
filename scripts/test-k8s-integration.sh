#!/bin/bash

set -e

CLUSTER_NAME="vizcore-test"
NAMESPACE="vizcore"
IMAGE_NAME="vizcore:latest"

echo "Starting VizCore Kubernetes Integration Tests"

cleanup() {
    echo "Cleaning up..."
    
    pkill -f "kubectl port-forward" || true
    
    if kind get clusters | grep -q "$CLUSTER_NAME"; then
        echo "Deleting kind cluster: $CLUSTER_NAME"
        kind delete cluster --name "$CLUSTER_NAME"
    fi
}

trap cleanup EXIT

check_requirements() {
    echo "Checking requirements..."
    
    command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed."; exit 1; }
    command -v kubectl >/dev/null 2>&1 || { echo "kubectl is required but not installed."; exit 1; }
    command -v kind >/dev/null 2>&1 || { echo "kind is required but not installed."; exit 1; }
    command -v npm >/dev/null 2>&1 || { echo "npm is required but not installed."; exit 1; }
    
    echo "All requirements satisfied"
}

create_cluster() {
    echo "Creating kind cluster: $CLUSTER_NAME"
    
    if kind get clusters | grep -q "$CLUSTER_NAME"; then
        echo "Cluster already exists, deleting first..."
        kind delete cluster --name "$CLUSTER_NAME"
    fi
    
    cat <<EOF | kind create cluster --name "$CLUSTER_NAME" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF
    
    echo "Kind cluster created"
}

build_and_load_image() {
    echo "Building Docker image: $IMAGE_NAME"
    
    docker build -t "$IMAGE_NAME" .
    
    echo "Loading image into kind cluster..."
    kind load docker-image "$IMAGE_NAME" --name "$CLUSTER_NAME"
    
    echo "Docker image built and loaded"
}

deploy_to_k8s() {
    echo "Deploying to Kubernetes..."
    
    kubectl apply -k k8s/
    
    echo "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/vizcore-app -n "$NAMESPACE"
    
    echo "Checking pod status..."
    kubectl get pods -n "$NAMESPACE"
    
    echo "Deployment ready"
}

setup_port_forward() {
    echo "Setting up port forwarding..."
    
    kubectl port-forward service/vizcore-service 3000:80 -n "$NAMESPACE" &
    PORT_FORWARD_PID=$!
    
    echo "Waiting for port forwarding to be ready..."
    sleep 10
    
    for i in {1..30}; do
        if curl -s http://localhost:3000/health > /dev/null 2>&1; then
            echo "Port forwarding ready"
            return 0
        fi
        echo "Waiting for service to be ready... ($i/30)"
        sleep 2
    done
    
    echo "Port forwarding failed to become ready"
    return 1
}

run_integration_tests() {
    echo "Running integration tests..."
    
    cd tests/integration
    npm install
    
    export TEST_BASE_URL="http://localhost:3000"
    export CI=true
    
    npm test
    
    cd ../..
    
    echo "Integration tests completed"
}

main() {
    echo "VizCore Kubernetes Integration Test Suite"
    echo "============================================="
    
    check_requirements
    create_cluster
    build_and_load_image
    deploy_to_k8s
    setup_port_forward
    run_integration_tests
    
    echo ""
    echo "All tests completed successfully!"
    echo "============================================="
}
    
main "$@"
