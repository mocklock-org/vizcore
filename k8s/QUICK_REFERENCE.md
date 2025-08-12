# VizCore Kubernetes Quick Reference

## Essential Commands

### Deployment
```bash
# Deploy everything
kubectl apply -k k8s/

# Deploy specific resource
kubectl apply -f k8s/deployment.yaml
```

### Status Checks
```bash
# Check all resources
kubectl get all -n vizcore

# Check pods
kubectl get pods -n vizcore -o wide

# Check deployment status
kubectl rollout status deployment/vizcore-app -n vizcore

# Describe pod for troubleshooting
kubectl describe pod <pod-name> -n vizcore
```

### Logs
```bash
# View logs from all pods
kubectl logs -l app=vizcore -n vizcore

# Follow logs
kubectl logs -l app=vizcore -n vizcore -f

# Logs from specific pod
kubectl logs <pod-name> -n vizcore
```

### Scaling
```bash
# Scale deployment
kubectl scale deployment vizcore-app --replicas=5 -n vizcore

# Auto-scale (requires metrics-server)
kubectl autoscale deployment vizcore-app --cpu-percent=70 --min=3 --max=10 -n vizcore
```

### Access Application
```bash
# Port forward to local machine
kubectl port-forward service/vizcore-service 3000:80 -n vizcore

# Access via NodePort (if available)
curl http://localhost:30080

# Check service endpoints
kubectl get endpoints vizcore-service -n vizcore
```

### Configuration Updates
```bash
# Edit configmap
kubectl edit configmap vizcore-config -n vizcore

# Restart deployment to pick up changes
kubectl rollout restart deployment vizcore-app -n vizcore

# Check rollout history
kubectl rollout history deployment vizcore-app -n vizcore
```

### Troubleshooting
```bash
# Debug with temporary pod
kubectl run debug --image=busybox -it --rm --restart=Never -n vizcore -- sh

# Check resource usage
kubectl top pods -n vizcore
kubectl top nodes

# Check events
kubectl get events -n vizcore --sort-by='.lastTimestamp'

# Network debugging
kubectl exec -it <pod-name> -n vizcore -- sh
```

### Cleanup
```bash
# Delete all resources
kubectl delete -k k8s/

# Delete namespace (removes everything)
kubectl delete namespace vizcore

# Delete specific resource
kubectl delete deployment vizcore-app -n vizcore
```

## Resource Specifications

### Deployment
- **Image**: `vizcore:latest`
- **Replicas**: 3
- **Port**: 3000
- **Resources**: 256Mi-512Mi RAM, 250m-500m CPU

### Services
- **ClusterIP**: `vizcore-service` (Port 80)
- **NodePort**: `vizcore-nodeport` (Port 30080)

### Health Checks
- **Liveness**: `/health` (30s delay, 10s interval)
- **Readiness**: `/ready` (5s delay, 5s interval)

### Security
- **User ID**: 1001 (non-root)
- **Read-only filesystem**: Yes
- **Capabilities**: All dropped

## Environment Variables

| Variable | Value | Source |
|----------|-------|---------|
| NODE_ENV | production | ConfigMap |
| LOG_LEVEL | info | ConfigMap |
| MEMORY_THRESHOLD | 80 | ConfigMap |
| PERFORMANCE_MONITORING | true | ConfigMap |

## Common Issues & Solutions

### Pod Not Starting
1. Check image availability: `kubectl describe pod <pod-name> -n vizcore`
2. Verify resource limits: `kubectl top nodes`
3. Check events: `kubectl get events -n vizcore`

### Health Check Failures
1. Verify endpoints exist: `curl http://localhost:3000/health`
2. Check application logs: `kubectl logs <pod-name> -n vizcore`
3. Test network connectivity: `kubectl exec -it <pod-name> -n vizcore -- wget -qO- localhost:3000/health`

### Service Not Accessible
1. Check service endpoints: `kubectl get endpoints -n vizcore`
2. Verify pod labels match service selector
3. Test internal connectivity: `kubectl run test --image=busybox -it --rm -n vizcore -- wget -qO- vizcore-service`

### Configuration Not Applied
1. Restart deployment: `kubectl rollout restart deployment vizcore-app -n vizcore`
2. Check configmap: `kubectl get configmap vizcore-config -n vizcore -o yaml`
3. Verify environment variables: `kubectl exec <pod-name> -n vizcore -- env`
