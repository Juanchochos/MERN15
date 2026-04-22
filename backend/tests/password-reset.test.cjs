const request = require('supertest');
const md5 = require('md5');

jest.mock('../models/user.cjs', () => ({
  findOne: jest.fn(),
}));
const User = require('../models/user.cjs');

jest.mock('../services/auth_email.cjs', () => ({
  generateVerificationCode: jest.fn(),
  sendEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));
const authEmail = require('../services/auth_email.cjs');

const { createApiApp } = require('../createApiApp.cjs');

describe('password reset flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authEmail.generateVerificationCode.mockReturnValue('123456');
    authEmail.sendPasswordResetEmail.mockResolvedValue({ id: 'email-1' });
  });

  describe('POST /api/request-password-reset', () => {
    it('returns 404 when user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/request-password-reset')
        .send({ login: 'RickL' });

      expect(User.findOne).toHaveBeenCalledWith({ login: 'RickL' });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
    });

    it('stores a hashed code and emails it to the user', async () => {
      const user = {
        login: 'RickL',
        email: 'rick@example.com',
        passwordResetCodeHash: null,
        passwordResetExpiresAt: null,
        passwordResetVerifiedExpiresAt: new Date(),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/request-password-reset')
        .send({ login: 'RickL' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Password reset code sent' });
      expect(user.passwordResetCodeHash).toBe(md5('123456'));
      expect(user.passwordResetExpiresAt).toBeInstanceOf(Date);
      expect(user.passwordResetVerifiedExpiresAt).toBeNull();
      expect(user.save).toHaveBeenCalled();
      expect(authEmail.sendPasswordResetEmail).toHaveBeenCalledWith('rick@example.com', '123456');
    });
  });

  describe('POST /api/verify-password-reset', () => {
    it('returns 400 when no password reset was requested', async () => {
      User.findOne.mockResolvedValue({
        login: 'RickL',
        passwordResetCodeHash: null,
        passwordResetExpiresAt: null,
        save: jest.fn(),
      });

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/verify-password-reset')
        .send({ login: 'RickL', code: '123456' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No password reset requested' });
    });

    it('returns 400 when the reset code is invalid', async () => {
      User.findOne.mockResolvedValue({
        login: 'RickL',
        passwordResetCodeHash: md5('654321'),
        passwordResetExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        save: jest.fn(),
      });

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/verify-password-reset')
        .send({ login: 'RickL', code: '123456' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid verification code' });
    });

    it('clears the code when the reset code is expired', async () => {
      const user = {
        login: 'RickL',
        passwordResetCodeHash: md5('123456'),
        passwordResetExpiresAt: new Date(Date.now() - 1000),
        passwordResetVerifiedExpiresAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/verify-password-reset')
        .send({ login: 'RickL', code: '123456' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Password reset code expired' });
      expect(user.passwordResetCodeHash).toBeNull();
      expect(user.passwordResetExpiresAt).toBeNull();
      expect(user.passwordResetVerifiedExpiresAt).toBeNull();
      expect(user.save).toHaveBeenCalled();
    });

    it('marks the reset request as verified when the code is correct', async () => {
      const user = {
        login: 'RickL',
        passwordResetCodeHash: md5('123456'),
        passwordResetExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        passwordResetVerifiedExpiresAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/verify-password-reset')
        .send({ login: 'RickL', code: '123456' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Password reset verified' });
      expect(user.passwordResetCodeHash).toBeNull();
      expect(user.passwordResetExpiresAt).toBeNull();
      expect(user.passwordResetVerifiedExpiresAt).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/reset-password', () => {
    it('returns 400 when the reset flow has not been verified', async () => {
      User.findOne.mockResolvedValue({
        login: 'RickL',
        passwordResetVerifiedExpiresAt: null,
        save: jest.fn(),
      });

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/reset-password')
        .send({ login: 'RickL', password: 'newPassword' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Password reset not verified' });
    });

    it('clears expired verification before rejecting the password reset', async () => {
      const user = {
        login: 'RickL',
        passwordResetVerifiedExpiresAt: new Date(Date.now() - 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/reset-password')
        .send({ login: 'RickL', password: 'newPassword' });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Password reset verification expired' });
      expect(user.passwordResetVerifiedExpiresAt).toBeNull();
      expect(user.save).toHaveBeenCalled();
    });

    it('updates the password when the reset flow has been verified', async () => {
      const user = {
        login: 'RickL',
        password: md5('oldPassword'),
        passwordResetVerifiedExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(user);

      const app = createApiApp();
      const res = await request(app.callback())
        .post('/api/reset-password')
        .send({ login: 'RickL', password: 'newPassword' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Password reset successful' });
      expect(user.password).toBe(md5('newPassword'));
      expect(user.passwordResetVerifiedExpiresAt).toBeNull();
      expect(user.save).toHaveBeenCalled();
    });
  });
});
