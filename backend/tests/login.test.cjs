const request = require('supertest');
const md5 = require('md5');

// Mock User model before requiring createApiApp usage
jest.mock('../models/user.cjs', () => ({
  findOne: jest.fn(),
}));
const User = require('../models/user.cjs');

const { createApiApp } = require('../createApiApp.cjs');

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SKIP_EMAIL_VERIFICATION = 'true';
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('returns Login/Password incorrect for invalid credentials', async () => {
    User.findOne.mockResolvedValue(null);

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/login')
      .send({ login: 'wrongUser', password: 'wrongPass' });

    expect(User.findOne).toHaveBeenCalledWith({
      login: 'wrongUser',
      password: md5('wrongPass'),
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ error: 'Login/Password incorrect' });
  });

  it('returns a token when RickL logs in with COP4331 (skip email)', async () => {
    User.findOne.mockResolvedValue({
      firstName: 'Rick',
      lastName: 'L',
      _id: '507f1f77bcf86cd799439011',
    });
    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/login')
      .send({ login: 'RickL', password: 'COP4331' });
    expect(User.findOne).toHaveBeenCalledWith({
      login: 'RickL',
      password: md5('COP4331'),
    });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.accessToken.split('.')).toHaveLength(3); 

    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(res.body.accessToken, 'test-secret');
    expect(payload.firstName).toBe('Rick');
    expect(payload.lastName).toBe('L');
    expect(String(payload.userId)).toBe('507f1f77bcf86cd799439011');
  });

});