const request = require('supertest');
const md5 = require('md5');

// Mock User as constructor function + static findOne
jest.mock('../models/user.cjs', () => {
  const MockUser = jest.fn(function (data) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({
      ...data,
      _id: '507f1f77bcf86cd799439022',
    });
  });

  MockUser.findOne = jest.fn();
  return MockUser;
});

jest.mock('../services/auth_email.cjs', () => ({
  generateVerificationCode: jest.fn(() => '123456'),
  sendSignupVerificationEmail: jest.fn().mockResolvedValue({ id: 'email-1' }),
  sendEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const User = require('../models/user.cjs');
const authEmail = require('../services/auth_email.cjs');
const { createApiApp } = require('../createApiApp.cjs');

describe('POST /api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
    process.env.SKIP_EMAIL_VERIFICATION = 'false';
  });

  it('returns 409 if user already exists', async () => {
    User.findOne.mockResolvedValue({ _id: 'existing-user' });

    const app = createApiApp();
    const res = await request(app.callback()).post('/api/register').send({
      login: 'RickL',
      password: 'COP4331',
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
    });

    expect(User.findOne).toHaveBeenCalledWith({ login: 'RickL' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'User Already Exists' });
  });

  it('returns 409 if email already exists', async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: 'existing-email-user' });

    const app = createApiApp();
    const res = await request(app.callback()).post('/api/register').send({
      login: 'RickL',
      password: 'COP4331',
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
    });

    expect(User.findOne).toHaveBeenCalledWith({ login: 'RickL' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'rick@example.com' });
    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Email Already Exists' });
  });

  it('registers user and sends signup verification code', async () => {
    User.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const app = createApiApp();
    const res = await request(app.callback()).post('/api/register').send({
      login: 'RickL',
      password: 'COP4331',
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
    });

    expect(User.findOne).toHaveBeenCalledWith({ login: 'RickL' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'rick@example.com' });

    expect(User).toHaveBeenCalledWith({
      login: 'RickL',
      password: md5('COP4331'),
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
      isEmailVerified: false,
      loginVerificationCodeHash: md5('123456'),
      loginVerificationExpiresAt: expect.any(Date),
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'Verification code sent',
      requiresVerification: true,
      login: 'RickL',
    });
    expect(authEmail.sendSignupVerificationEmail).toHaveBeenCalledWith('rick@example.com', '123456');
  });
});
