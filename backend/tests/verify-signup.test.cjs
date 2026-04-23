const request = require('supertest');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

jest.mock('../models/user.cjs', () => ({
  findOne: jest.fn(),
}));
const User = require('../models/user.cjs');

const { createApiApp } = require('../createApiApp.cjs');

describe('POST /api/verify-signup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
  });

  it('returns 404 when user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/verify-signup')
      .send({ login: 'RickL', code: '123456' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('returns 400 when no verification code was requested', async () => {
    User.findOne.mockResolvedValue({
      login: 'RickL',
      isEmailVerified: false,
      loginVerificationCodeHash: null,
      loginVerificationExpiresAt: null,
      save: jest.fn(),
    });

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/verify-signup')
      .send({ login: 'RickL', code: '123456' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'No verification code requested' });
  });

  it('returns 400 when verification code is invalid', async () => {
    User.findOne.mockResolvedValue({
      login: 'RickL',
      isEmailVerified: false,
      firstName: 'Rick',
      lastName: 'L',
      _id: '507f1f77bcf86cd799439011',
      loginVerificationCodeHash: md5('654321'),
      loginVerificationExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      save: jest.fn(),
    });

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/verify-signup')
      .send({ login: 'RickL', code: '123456' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid verification code' });
  });

  it('returns 400 when verification code is expired', async () => {
    const user = {
      login: 'RickL',
      isEmailVerified: false,
      loginVerificationCodeHash: md5('123456'),
      loginVerificationExpiresAt: new Date(Date.now() - 1000),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(user);

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/verify-signup')
      .send({ login: 'RickL', code: '123456' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Verification code expired' });
    expect(user.loginVerificationCodeHash).toBeNull();
    expect(user.loginVerificationExpiresAt).toBeNull();
  });

  it('marks email verified and returns a token when the code is correct', async () => {
    const user = {
      login: 'RickL',
      isEmailVerified: false,
      firstName: 'Rick',
      lastName: 'L',
      _id: '507f1f77bcf86cd799439011',
      loginVerificationCodeHash: md5('123456'),
      loginVerificationExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      save: jest.fn().mockResolvedValue(true),
    };
    User.findOne.mockResolvedValue(user);

    const app = createApiApp();
    const res = await request(app.callback())
      .post('/api/verify-signup')
      .send({ login: 'RickL', code: '123456' });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    const payload = jwt.verify(res.body.accessToken, 'test-secret');
    expect(payload.firstName).toBe('Rick');
    expect(payload.lastName).toBe('L');
    expect(String(payload.userId)).toBe('507f1f77bcf86cd799439011');

    expect(user.isEmailVerified).toBe(true);
    expect(user.loginVerificationCodeHash).toBeNull();
    expect(user.loginVerificationExpiresAt).toBeNull();
    expect(user.save).toHaveBeenCalled();
  });
});
