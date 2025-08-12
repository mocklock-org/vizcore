# VizCore Kubernetes Deployment Checklist

## Pre-Deployment Checklist

### Infrastructure Requirements
- [ ] Kubernetes cluster is running (v1.20+)
- [ ] kubectl is configured and can connect to cluster
- [ ] Docker image `vizcore:latest` is built and available
- [ ] Sufficient cluster resources available
  - [ ] At least 768Mi RAM available (3 pods × 256Mi)
  - [ ] At least 750m CPU available (3 pods × 250m)

### Optional Components
- [ ] NGINX Ingress Controller installed (for external access)
- [ ] cert-manager installed (for TLS certificates)
- [ ] Metrics server installed (for HPA)
- [ ] Monitoring stack (Prometheus/Grafana) configured

## Deployment Steps

### 1. Namespace and Configuration
- [ ] Deploy namespace: `kubectl apply -f k8s/namespace.yaml`
- [ ] Verify namespace created: `kubectl get namespace vizcore`
- [ ] Deploy configmap: `kubectl apply -f k8s/configmap.yaml`
- [ ] Verify configmap: `kubectl get configmap -n vizcore`

### 2. Application Deployment
- [ ] Deploy application: `kubectl apply -f k8s/deployment.yaml`
- [ ] Wait for rollout: `kubectl rollout status deployment/vizcore-app -n vizcore`
- [ ] Verify pods are running: `kubectl get pods -n vizcore`
- [ ] Check pod logs: `kubectl logs -l app=vizcore -n vizcore`

### 3. Service Configuration
- [ ] Deploy services: `kubectl apply -f k8s/service.yaml`
- [ ] Verify services: `kubectl get services -n vizcore`
- [ ] Check service endpoints: `kubectl get endpoints -n vizcore`

### 4. Ingress Setup (Optional)
- [ ] Update domain in `k8s/ingress.yaml`
- [ ] Deploy ingress: `kubectl apply -f k8s/ingress.yaml`
- [ ] Verify ingress: `kubectl get ingress -n vizcore`
- [ ] Check TLS certificate: `kubectl describe ingress vizcore-ingress -n vizcore`

### 5. Full Stack Deployment (Alternative)
- [ ] Deploy all at once: `kubectl apply -k k8s/`
- [ ] Verify all resources: `kubectl get all -n vizcore`

## Post-Deployment Verification

### Health Checks
- [ ] Pods are in Running state: `kubectl get pods -n vizcore`
- [ ] All replicas are ready: `kubectl get deployment -n vizcore`
- [ ] Health endpoints respond:
  - [ ] Liveness probe: `/health`
  - [ ] Readiness probe: `/ready`

### Connectivity Tests
- [ ] Internal service connectivity:
  ```bash
  kubectl run test --image=busybox -it --rm -n vizcore -- wget -qO- vizcore-service/health
  ```
- [ ] Port forwarding works:
  ```bash
  kubectl port-forward service/vizcore-service 3000:80 -n vizcore
  curl http://localhost:3000/health
  ```
- [ ] NodePort access (if applicable):
  ```bash
  curl http://localhost:30080/health
  ```
- [ ] Ingress access (if configured):
  ```bash
  curl https://vizcore.yourdomain.com/health
  ```

### Resource Verification
- [ ] Resource usage within limits: `kubectl top pods -n vizcore`
- [ ] No resource warnings in events: `kubectl get events -n vizcore`
- [ ] Persistent volumes mounted correctly (if any)

### Security Verification
- [ ] Pods running as non-root: `kubectl exec <pod-name> -n vizcore -- id`
- [ ] Read-only filesystem enforced
- [ ] Security context applied correctly
- [ ] Network policies working (if configured)

## Performance Testing

### Load Testing
- [ ] Application responds under normal load
- [ ] Resource usage is within expected ranges
- [ ] Auto-scaling works (if HPA configured)
- [ ] Health checks remain stable under load

### Monitoring
- [ ] Application metrics are being collected
- [ ] Log aggregation is working
- [ ] Alerts are configured for critical issues
- [ ] Dashboard shows expected metrics

## Troubleshooting Checklist

### If Pods Won't Start
- [ ] Check image pull policy and availability
- [ ] Verify resource requests vs available cluster resources
- [ ] Check for configuration errors in deployment manifest
- [ ] Review pod events: `kubectl describe pod <pod-name> -n vizcore`

### If Health Checks Fail
- [ ] Verify application exposes `/health` and `/ready` endpoints
- [ ] Check application logs for startup errors
- [ ] Test endpoints manually: `kubectl exec <pod-name> -n vizcore -- wget -qO- localhost:3000/health`
- [ ] Adjust probe timing if application needs more startup time

### If Service Not Accessible
- [ ] Verify service selector matches pod labels
- [ ] Check if service endpoints are populated
- [ ] Test service from within cluster
- [ ] Verify ingress configuration (if using ingress)

### If Configuration Not Applied
- [ ] Check configmap exists and has correct data
- [ ] Verify environment variables in pod
- [ ] Restart deployment if configmap was updated
- [ ] Check for syntax errors in YAML files

## Rollback Procedure

### If Deployment Fails
```bash
# Check rollout history
kubectl rollout history deployment vizcore-app -n vizcore

# Rollback to previous version
kubectl rollout undo deployment vizcore-app -n vizcore

# Rollback to specific revision
kubectl rollout undo deployment vizcore-app --to-revision=2 -n vizcore
```

### Emergency Cleanup
```bash
# Scale down to zero
kubectl scale deployment vizcore-app --replicas=0 -n vizcore

# Delete problematic resources
kubectl delete -k k8s/

# Complete cleanup
kubectl delete namespace vizcore
```

## Maintenance Tasks

### Regular Checks
- [ ] Monitor resource usage trends
- [ ] Review application logs for errors
- [ ] Check certificate expiration (if using TLS)
- [ ] Update base images regularly
- [ ] Review and update resource limits based on usage

### Backup Considerations
- [ ] Export configuration: `kubectl get all,configmap,ingress -n vizcore -o yaml > backup.yaml`
- [ ] Document any manual configuration changes
- [ ] Keep deployment manifests in version control
- [ ] Test restore procedures periodically

## Sign-off

### Deployment Team
- [ ] Infrastructure Engineer: _________________ Date: _______
- [ ] Application Developer: _________________ Date: _______
- [ ] Security Review: _________________ Date: _______
- [ ] Operations Team: _________________ Date: _______

### Go-Live Approval
- [ ] All tests passed
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained on operations
- [ ] Rollback plan tested

**Final Approval**: _________________ Date: _______
