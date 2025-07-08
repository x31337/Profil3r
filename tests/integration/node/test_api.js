/**
 * Integration tests for Node.js services using supertest
 * This file contains various test cases for different API endpoints with positive and negative scenarios.
 */
const request = require('supertest');
const express = require('express');
const { expect } = require('chai');

// Configuration
const TEST_CONFIG = {
  services: {
    'js-tools': {
      port: 3000,
      baseUrl: 'http://localhost:3000'
    },
    'facebook-messenger': {
      port: 4444,
      baseUrl: 'http://localhost:4444'
    },
    'osint-framework': {
      port: 8000,
      baseUrl: 'http://localhost:8000'
    }
  },
  timeouts: {
    request: 10000,
    healthCheck: 5000
  }
};

// Test data
const testData = {
  validUsername: 'testuser123',
  validEmail: 'test@example.com',
  validDomain: 'example.com',
  invalidUsername: '',
  invalidEmail: 'invalid-email',
  invalidDomain: 'invalid..domain',
  nonexistentResource: 'nonexistent123456789',
  largeInput: 'a'.repeat(1000),
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  sqlInjection: "'; DROP TABLE users; --",
  xssPayload: "<script>alert('xss')</script>",
  unicodeInput: 'тест用户名🚀',
  messageData: {
    recipient: 'test@example.com',
    message: 'Test message',
    delay: 0
  }
};

// API endpoints
const apiEndpoints = {
  health: {
    'js-tools': '/api/health',
    'facebook-messenger': '/api/health',
    'osint-framework': '/api/health'
  },
  osint: {
    username: '/api/osint/username/{username}',
    email: '/api/osint/email/{email}',
    domain: '/api/network/domain/{domain}'
  },
  messenger: {
    login: '/api/messenger/login',
    send: '/api/messenger/send',
    status: '/api/messenger/status',
    history: '/api/messenger/history'
  },
  facebook: {
    friends: '/api/facebook/friends',
    messages: '/api/facebook/messages',
    groups: '/api/facebook/groups',
    setmessage: '/setmessage',
    getmessage: '/getmessage',
    newmessage: '/newmessage',
    sendmessage: '/sendmessage'
  }
};

// Helper function to make requests to different services
const makeRequest = (service, path) => {
  const baseUrl = TEST_CONFIG.services[service].baseUrl;
  return request(baseUrl);
};

describe('Integration Tests - Node.js Services', () => {
  describe('Health Check Endpoints', () => {
    Object.keys(TEST_CONFIG.services).forEach(service => {
      it(`should return 200 for ${service} health check`, async () => {
        const endpoint = apiEndpoints.health[service];
        if (endpoint) {
          const res = await makeRequest(service, endpoint)
            .get(endpoint)
            .timeout(TEST_CONFIG.timeouts.healthCheck);

          expect(res.status).to.equal(200);
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal('ok');
        }
      });
    });
  });

  describe('OSINT API Endpoints', () => {
    describe('Username Search', () => {
      it('should return 200 for valid username search', async () => {
        const endpoint = apiEndpoints.osint.username.replace(
          '{username}',
          testData.validUsername
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('username');
        expect(res.body.username).to.equal(testData.validUsername);
      });

      it('should return 400 for invalid username search', async () => {
        const endpoint = apiEndpoints.osint.username.replace(
          '{username}',
          testData.invalidUsername
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
      });

      it('should return 404 for nonexistent username', async () => {
        const endpoint = apiEndpoints.osint.username.replace(
          '{username}',
          testData.nonexistentResource
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(404);
      });
    });

    describe('Email Lookup', () => {
      it('should return 200 for valid email lookup', async () => {
        const endpoint = apiEndpoints.osint.email.replace(
          '{email}',
          testData.validEmail
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('email');
      });

      it('should return 400 for invalid email lookup', async () => {
        const endpoint = apiEndpoints.osint.email.replace(
          '{email}',
          testData.invalidEmail
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
      });
    });

    describe('Domain Information', () => {
      it('should return 200 for valid domain lookup', async () => {
        const endpoint = apiEndpoints.osint.domain.replace(
          '{domain}',
          testData.validDomain
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('domain');
      });

      it('should return 400 for invalid domain lookup', async () => {
        const endpoint = apiEndpoints.osint.domain.replace(
          '{domain}',
          testData.invalidDomain
        );
        const res = await makeRequest('osint-framework', endpoint)
          .get(endpoint)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(400);
        expect(res.body).to.have.property('error');
      });
    });
  });

  describe('Facebook Messenger API', () => {
    describe('Message Management', () => {
      it('should set message successfully', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.setmessage
        )
          .post(apiEndpoints.facebook.setmessage)
          .send({ message: 'Test Message', messageID: 0 })
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
      });

      it('should get message successfully', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.getmessage
        )
          .get(apiEndpoints.facebook.getmessage + '?id=1')
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message');
      });

      it('should create new message successfully', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.newmessage
        )
          .post(apiEndpoints.facebook.newmessage)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
      });

      it('should fail to send message without valid session', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.sendmessage
        )
          .post(apiEndpoints.facebook.sendmessage)
          .send({ message: 'Test Message' })
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(401);
      });
    });

    describe('Friends Management', () => {
      it('should get friends list with authentication', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.friends
        )
          .get(apiEndpoints.facebook.friends)
          .set('Authorization', 'Bearer test-token')
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(200);
      });

      it('should fail to get friends list without authentication', async () => {
        const res = await makeRequest(
          'facebook-messenger',
          apiEndpoints.facebook.friends
        )
          .get(apiEndpoints.facebook.friends)
          .timeout(TEST_CONFIG.timeouts.request);

        expect(res.status).to.equal(401);
      });
    });
  });

  describe('Security Tests', () => {
    it('should prevent SQL injection attacks', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        testData.sqlInjection
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.contain('Invalid input');
    });

    it('should prevent XSS attacks', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        encodeURIComponent(testData.xssPayload)
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
    });

    it('should handle large input gracefully', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        testData.largeInput
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(413); // Payload too large
    });

    it('should handle special characters properly', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        encodeURIComponent(testData.specialChars)
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(400);
    });

    it('should handle unicode input correctly', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        encodeURIComponent(testData.unicodeInput)
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.be.oneOf([200, 400]); // Should handle gracefully
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should enforce rate limiting on OSINT endpoints', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        'rate_limit_test'
      );

      // Make multiple requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 65; i++) {
        requests.push(
          makeRequest('osint-framework', endpoint)
            .get(endpoint)
            .timeout(TEST_CONFIG.timeouts.request)
        );
      }

      const results = await Promise.allSettled(requests);
      const rateLimitedRequests = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(rateLimitedRequests.length).to.be.greaterThan(0);
    });

    it('should enforce rate limiting on Facebook operations', async () => {
      const endpoint = apiEndpoints.facebook.friends;

      // Make multiple requests to trigger rate limiting
      const requests = [];
      for (let i = 0; i < 15; i++) {
        requests.push(
          makeRequest('facebook-messenger', endpoint)
            .get(endpoint)
            .set('Authorization', 'Bearer test-token')
            .timeout(TEST_CONFIG.timeouts.request)
        );
      }

      const results = await Promise.allSettled(requests);
      const rateLimitedRequests = results.filter(
        result => result.status === 'fulfilled' && result.value.status === 429
      );

      expect(rateLimitedRequests.length).to.be.greaterThan(0);
    });
  });

  describe('Error Handling Tests', () => {
    it('should return 404 for non-existent endpoints', async () => {
      const res = await makeRequest('js-tools', '/api/nonexistent')
        .get('/api/nonexistent')
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(404);
    });

    it('should return 405 for unsupported HTTP methods', async () => {
      const res = await makeRequest('js-tools', apiEndpoints.health['js-tools'])
        .delete(apiEndpoints.health['js-tools'])
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(405);
    });

    it('should return proper error format', async () => {
      const endpoint = apiEndpoints.osint.username.replace(
        '{username}',
        testData.invalidUsername
      );
      const res = await makeRequest('osint-framework', endpoint)
        .get(endpoint)
        .timeout(TEST_CONFIG.timeouts.request);

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error');
      expect(res.body.error).to.have.property('code');
      expect(res.body.error).to.have.property('message');
    });
  });

  describe('Performance Tests', () => {
    it('should respond to health checks within acceptable time', async () => {
      const startTime = Date.now();
      const res = await makeRequest('js-tools', apiEndpoints.health['js-tools'])
        .get(apiEndpoints.health['js-tools'])
        .timeout(TEST_CONFIG.timeouts.healthCheck);

      const responseTime = Date.now() - startTime;
      expect(res.status).to.equal(200);
      expect(responseTime).to.be.below(500); // 500ms threshold
    });

    it('should handle concurrent requests efficiently', async () => {
      const endpoint = apiEndpoints.health['js-tools'];

      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(
          makeRequest('js-tools', endpoint)
            .get(endpoint)
            .timeout(TEST_CONFIG.timeouts.request)
        );
      }

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      results.forEach(res => expect(res.status).to.equal(200));
      expect(totalTime).to.be.below(2000); // 2 seconds for 10 concurrent requests
    });
  });
});
