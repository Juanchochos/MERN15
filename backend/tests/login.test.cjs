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
});