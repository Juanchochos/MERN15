const request = require('supertest');
const md5 = require('md5');
const jwt = require('jsonwebtoken');

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

const User = require('../models/user.cjs');
const { createApiApp } = require('../createApiApp.cjs');

describe('POST /api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-secret';
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

  it('registers user and returns JWT token', async () => {
    User.findOne.mockResolvedValue(null);

    const app = createApiApp();
    const res = await request(app.callback()).post('/api/register').send({
      login: 'RickL',
      password: 'COP4331',
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
    });

    expect(User.findOne).toHaveBeenCalledWith({ login: 'RickL' });

    // Ensure constructor received hashed password
    expect(User).toHaveBeenCalledWith({
      login: 'RickL',
      password: md5('COP4331'),
      firstName: 'Rick',
      lastName: 'L',
      email: 'rick@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();

    const payload = jwt.verify(res.body.accessToken, 'test-secret');
    expect(payload.firstName).toBe('Rick');
    expect(payload.lastName).toBe('L');
    expect(String(payload.userId)).toBe('507f1f77bcf86cd799439022');
  });
});