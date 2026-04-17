const request = require('supertest');

// Bypass auth middleware for this test file
jest.mock('../middleware/auth.cjs', () => {
  return async (ctx, next) => {
    ctx.state.user = { userId: 'u1' };
    ctx.state.refreshedToken = 'refreshed-token';
    await next();
  };
});

// Mock GameHistory model as a constructor with validate/save instance methods
jest.mock('../models/gameHistory.cjs', () => {
  return jest.fn(function (data) {
    Object.assign(this, data);
    this.validate = jest.fn().mockResolvedValue(true);
    this.save = jest.fn().mockResolvedValue(true);
  });
});

const GameHistory = require('../models/gameHistory.cjs');
const { createApiApp } = require('../createApiApp.cjs');

describe('POST /api/add-match-history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('adds match history and returns 201', async () => {
    const app = createApiApp();

    const body = {
      userId: '507f1f77bcf86cd799439011',
      players: [{ name: 'RickL' }, { name: 'Ana' }],
      winners: [{ name: 'RickL' }],
      losers: [{ name: 'Ana' }],
      timeFinished: Date.now() - 1000,
    };

    const res = await request(app.callback())
      .post('/api/add-match-history')
      .set('Authorization', 'Bearer fake-token')
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      message: 'Added match to match history',
      accessToken: 'refreshed-token',
    });

    expect(GameHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: body.userId,
        players: body.players,
        winners: body.winners,
        losers: body.losers,
        timeFinished: body.timeFinished,
      })
    );
  });
});