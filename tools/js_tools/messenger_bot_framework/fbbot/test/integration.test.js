const request = require('supertest');
const express = require('express');
const app = require('../../tools/js_tools/messenger_bot_framework/fbbot/server');  // Adjust path as needed

// Basic integration tests

describe('API Endpoints', () => {
  it('GET /health - should return status 200 for health check', async () => {
    await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('POST /setmessage - should handle valid message', async () => {
    await request(app)
      .post('/setmessage')
      .send({ message: 'Test Message', messageID: 0 })
      .expect(200);
  });

  it('POST /setmessage - should return failure for invalid input', async () => {
    await request(app)
      .post('/setmessage')
      .send({ invalid: true })
      .expect(400);
  });

  it('GET /getmessage - should return a message', async () => {
    await request(app)
      .get('/getmessage?id=1')
      .expect('Content-Type', /json/)
      .expect(200);
  });

  it('POST /sendmessage - should fail without valid session', async () => {
    await request(app)
      .post('/sendmessage')
      .expect(400);
  });

  // Add more tests as needed
});

