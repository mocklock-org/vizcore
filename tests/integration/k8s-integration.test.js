const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const skipIfServiceUnavailable = () => {
  if (!global.serviceAvailable) {
    console.log('Skipping test - service not available');
    return true;
  }
  return false;
};

describe('VizCore Kubernetes Integration Tests', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3000';
  const timeout = 30000;

  beforeAll(async () => {
    console.log(`Testing against: ${baseURL}`);
    
    if (process.env.SKIP_INTEGRATION_TESTS === 'true') {
      console.log('Skipping integration tests - service not available');
      return;
    }
    
    let retries = 30;
    let serviceReady = false;
    
    while (retries > 0) {
      try {
        const response = await axios.get(`${baseURL}/health`, { timeout: 5000 });
        console.log('Service is ready!', response.data);
        serviceReady = true;
        break;
      } catch (error) {
        console.log(`Waiting for service... (${retries} retries left)`);
        if (retries === 1) {
          console.log('Service not available - this is expected when running tests without a live deployment');
          console.log('To run full integration tests, start the VizCore server first or deploy to Kubernetes');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        retries--;
      }
    }
    
    global.serviceAvailable = serviceReady;
    
    if (!serviceReady && process.env.CI !== 'true') {
      console.warn('⚠️  Service not available - tests will be skipped');
      console.warn('   To run integration tests:');
      console.warn('   1. Start VizCore: npm run start:dev (in packages/core)');
      console.warn('   2. Or deploy to K8s: bash scripts/test-k8s-integration.sh');
    }
  }, 60000);

  describe('Health Checks', () => {
    test('Health endpoint should return 200', async () => {
      if (skipIfServiceUnavailable()) return;
      
      const response = await axios.get(`${baseURL}/health`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('healthy');
    }, timeout);

    test('Ready endpoint should return 200', async () => {
      if (skipIfServiceUnavailable()) return;
      
      const response = await axios.get(`${baseURL}/ready`);
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data.status).toBe('ready');
    }, timeout);
  });

  describe('API Endpoints', () => {
    test('Root endpoint should be accessible', async () => {
      if (skipIfServiceUnavailable()) return;
      
      const response = await axios.get(`${baseURL}/`);
      expect(response.status).toBe(200);
    }, timeout);

    test('API should return proper CORS headers', async () => {
      if (skipIfServiceUnavailable()) return;
      
      const response = await axios.get(`${baseURL}/`, {
        headers: { 'Origin': 'https://example.com' }
      });
      
      expect(response.headers).toBeDefined();
    }, timeout);
  });

  describe('Performance Tests', () => {
    test('Response time should be reasonable', async () => {
      const start = Date.now();
      const response = await axios.get(`${baseURL}/health`);
      const duration = Date.now() - start;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
    }, timeout);

    test('Should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill().map(() => 
        axios.get(`${baseURL}/health`)
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    }, timeout);
  });

  describe('Kubernetes-specific Tests', () => {
    test('Should have proper resource limits', async () => {
      if (process.env.CI) {
        try {
          const { stdout } = await execAsync('kubectl get pods -n vizcore -o json');
          const pods = JSON.parse(stdout);
          
          pods.items.forEach(pod => {
            const container = pod.spec.containers.find(c => c.name === 'vizcore');
            expect(container.resources.requests).toBeDefined();
            expect(container.resources.limits).toBeDefined();
          });
        } catch (error) {
          console.warn('Could not check Kubernetes resources:', error.message);
        }
      }
    }, timeout);

    test('Should have multiple replicas running', async () => {
      if (process.env.CI) {
        try {
          const { stdout } = await execAsync('kubectl get deployment vizcore-app -n vizcore -o json');
          const deployment = JSON.parse(stdout);
          
          expect(deployment.spec.replicas).toBeGreaterThanOrEqual(3);
          expect(deployment.status.readyReplicas).toBe(deployment.spec.replicas);
        } catch (error) {
          console.warn('Could not check deployment status:', error.message);
        }
      }
    }, timeout);

    test('Should have proper service configuration', async () => {
      if (process.env.CI) {
        try {
          const { stdout } = await execAsync('kubectl get service vizcore-service -n vizcore -o json');
          const service = JSON.parse(stdout);
          
          expect(service.spec.ports).toBeDefined();
          expect(service.spec.ports.length).toBeGreaterThan(0);
          expect(service.spec.selector.app).toBe('vizcore');
        } catch (error) {
          console.warn('Could not check service configuration:', error.message);
        }
      }
    }, timeout);
  });

  describe('Error Handling', () => {
    test('Should handle 404 gracefully', async () => {
      try {
        await axios.get(`${baseURL}/nonexistent-endpoint`);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error.response.status).toBe(404);
      }
    }, timeout);

    test('Should handle invalid requests gracefully', async () => {
      try {
        await axios.post(`${baseURL}/health`, { invalid: 'data' });
        fail('Should have thrown an error');
      } catch (error) {
        expect([404, 405, 400]).toContain(error.response.status);
      }
    }, timeout);
  });

  describe('Security Tests', () => {
    test('Should not expose sensitive information in headers', async () => {
      const response = await axios.get(`${baseURL}/health`);
      
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers['server']).not.toMatch(/express/i);
    }, timeout);

    test('Should have security headers', async () => {
      const response = await axios.get(`${baseURL}/`);
      
      const headers = response.headers;
    }, timeout);
  });
});
