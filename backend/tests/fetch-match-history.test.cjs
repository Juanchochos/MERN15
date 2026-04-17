const request = require('supertest');

// Mock auth middleware so route always passes auth
jest.mock('../middleware/auth.cjs', () => {
  return async (ctx, next) => {
    ctx.state.user = { userId: 'u1' };
    ctx.state.refreshedToken = 'refreshed-token';
    await next();
  };
});

// Mock GameHistory.find().sort().limit() chain
jest.mock('../models/gameHistory.cjs', () => ({
  find: jest.fn(),
}));

const GameHistory = require('../models/gameHistory.cjs');
const { createApiApp } = require('../createApiApp.cjs');

describe('GET /api/fetch-match-history', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns match history for a user', async () => {
    const fakeGames = [
      { guid: 'g1', userId: '507f1f77bcf86cd799439011', winners: [{ name: 'RickL' }] },
      { guid: 'g2', userId: '507f1f77bcf86cd799439011', winners: [{ name: 'Ana' }] },
    ];

    const limitMock = jest.fn().mockResolvedValue(fakeGames);
    const sortMock = jest.fn().mockReturnValue({ limit: limitMock });
    GameHistory.find.mockReturnValue({ sort: sortMock });

    const app = createApiApp();
    const res = await request(app.callback())
      .get('/api/fetch-match-history')
      .query({ userId: '507f1f77bcf86cd799439011' })
      .set('Authorization', 'Bearer fake-token');

    expect(GameHistory.find).toHaveBeenCalledWith({ userId: '507f1f77bcf86cd799439011' });
    expect(sortMock).toHaveBeenCalledWith({ date: -1 });
    expect(limitMock).toHaveBeenCalledWith(5);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: 'Successfully retrieved match history',
      data: fakeGames,
      accessToken: 'refreshed-token',
    });
  });
});