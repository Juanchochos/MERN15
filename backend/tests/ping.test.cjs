const request = require('supertest');
const { createApiApp } = require('../createApiApp.cjs');

describe('GET /api/ping', () => {
  it('returns 200 and Hello World message', async () => {
    const app = createApiApp();

    const res = await request(app.callback()).get('/api/ping');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello World' });
  });
});