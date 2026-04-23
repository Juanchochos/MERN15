const token = require("./src/createJWT.cjs");
const User = require("./models/user.cjs");
const Card = require("./models/card.cjs");
const md5 = require("md5");
const { koaBody } = require("koa-body");
const authEmail = require("./services/auth_email.cjs");
const GameHistory = require("./models/gameHistory.cjs");
const authenticateToken = require("./middleware/auth.cjs");


exports.setApp = function (server, client) {
  const skipEmailVerification = process.env.SKIP_EMAIL_VERIFICATION === 'true';

  server.router.get('/api/ping', async (ctx) => {
    ctx.status = 200;
    ctx.body = { message: 'Hello World' };
  });

  server.router.post('/api/login', koaBody(), async (ctx) => {
    try {
      const { login, password } = ctx.request.body || {};
      const hash = md5(password);
      const user = await User.findOne({ login: login, password: hash });

      if (!user) {
        ctx.status = 200;
        ctx.body = { error: "Login/Password incorrect" };
        return;
      }

      if (!user.isEmailVerified && !skipEmailVerification) {
        ctx.status = 403;
        ctx.body = { error: "Email not verified. Complete signup verification first." };
        return;
      }

      if (skipEmailVerification) {
        ctx.status = 200;
        ctx.body = {accessToken: token.createToken(user.firstName, user.lastName, user._id)};
        return;
      }

      try {
        const code = authEmail.generateVerificationCode();
        const codeHash = md5(code);

        user.loginVerificationCodeHash = codeHash;
        user.loginVerificationExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await authEmail.sendEmail(user.email, code);

        ctx.status = 200;
        ctx.body = { message: "Verification code sent", requiresVerification: true };
      } catch (e) {
        ctx.status = 500;
        ctx.body = { error: e.message };
      }
    } catch (e) {
      console.error("api/login", e);
      ctx.status = 503;
      ctx.body = { error: "Database unavailable. Check MongoDB URI and credentials in .env." };
    }
  });

  server.router.post('/api/verify-login', koaBody(), async (ctx) => {
    try {
      const { login, code } = ctx.request.body || {};
      const user = await User.findOne({ login: login });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      if (!user.loginVerificationCodeHash || !user.loginVerificationExpiresAt) {
        ctx.status = 400;
        ctx.body = { error: "No verification code requested" };
        return;
      }

      if (user.loginVerificationExpiresAt < new Date()) {
        user.loginVerificationCodeHash = null;
        user.loginVerificationExpiresAt = null;
        await user.save();
        ctx.status = 400;
        ctx.body = { error: "Verification code expired" };
        return;
      }

      if (md5(code) === user.loginVerificationCodeHash) {
        const ret = token.createToken(user.firstName, user.lastName, user._id);
        user.loginVerificationCodeHash = null;
        user.loginVerificationExpiresAt = null;
        await user.save();
        ctx.status = 200;
        ctx.body = ret;
      } else {
        ctx.status = 400;
        ctx.body = { error: "Invalid verification code" };
      }
    } catch (e) {
      console.error("api/verify-login", e);
      ctx.status = 503;
      ctx.body = { error: "Database unavailable. Check MongoDB URI and credentials in .env." };
    }
  });

  server.router.post('/api/request-password-reset', koaBody(), async (ctx) => {
    try {
      const { login } = ctx.request.body || {};
      const user = await User.findOne({ login: login });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      const code = authEmail.generateVerificationCode();
      const codeHash = md5(code);

      user.passwordResetCodeHash = codeHash;
      user.passwordResetExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
      user.passwordResetVerifiedExpiresAt = null;
      await user.save();

      await authEmail.sendPasswordResetEmail(user.email, code);

      ctx.status = 200;
      ctx.body = { message: "Password reset code sent" };
    } catch (e) {
      console.error("api/request-password-reset", e);
      ctx.status = 503;
      ctx.body = { error: "Unable to process password reset request." };
    }
  });

  server.router.post('/api/verify-password-reset', koaBody(), async (ctx) => {
    try {
      const { login, code } = ctx.request.body || {};
      const user = await User.findOne({ login: login });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      if (!user.passwordResetCodeHash || !user.passwordResetExpiresAt) {
        ctx.status = 400;
        ctx.body = { error: "No password reset requested" };
        return;
      }

      if (user.passwordResetExpiresAt < new Date()) {
        user.passwordResetCodeHash = null;
        user.passwordResetExpiresAt = null;
        user.passwordResetVerifiedExpiresAt = null;
        await user.save();
        ctx.status = 400;
        ctx.body = { error: "Password reset code expired" };
        return;
      }

      if (md5(code) === user.passwordResetCodeHash) {
        user.passwordResetCodeHash = null;
        user.passwordResetExpiresAt = null;
        user.passwordResetVerifiedExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        ctx.status = 200;
        ctx.body = { message: "Password reset verified" };
      } else {
        ctx.status = 400;
        ctx.body = { error: "Invalid verification code" };
      }
    } catch (e) {
      console.error("api/verify-password-reset", e);
      ctx.status = 503;
      ctx.body = { error: "Unable to verify password reset code." };
    }
  });

  server.router.post('/api/reset-password', koaBody(), async (ctx) => {
    try {
      const { login, password } = ctx.request.body || {};
      const user = await User.findOne({ login: login });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      if (!user.passwordResetVerifiedExpiresAt) {
        ctx.status = 400;
        ctx.body = { error: "Password reset not verified" };
        return;
      }

      if (user.passwordResetVerifiedExpiresAt < new Date()) {
        user.passwordResetVerifiedExpiresAt = null;
        await user.save();
        ctx.status = 400;
        ctx.body = { error: "Password reset verification expired" };
        return;
      }

      user.password = md5(password);
      user.passwordResetVerifiedExpiresAt = null;
      await user.save();

      ctx.status = 200;
      ctx.body = { message: "Password reset successful" };
    } catch (e) {
      console.error("api/reset-password", e);
      ctx.status = 503;
      ctx.body = { error: "Unable to reset password." };
    }
  });

  server.router.post('/api/register', koaBody(), async (ctx) => {
    const { login, password, firstName, lastName, email } = ctx.request.body;

    try {
      const existingByLogin = await User.findOne({ login: login });
      if (existingByLogin) {
        ctx.status = 409;
        ctx.body = { error: "User Already Exists" };
        return;
      }

      const existingByEmail = await User.findOne({ email: email });
      if (existingByEmail) {
        ctx.status = 409;
        ctx.body = { error: "Email Already Exists" };
        return;
      }

      const hash = md5(password);
      const shouldVerifyEmail = !skipEmailVerification;
      const code = shouldVerifyEmail ? authEmail.generateVerificationCode() : null;

       const newUser = new User({
        login: login,
        password: hash,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash,
        isEmailVerified: skipEmailVerification,
        loginVerificationCodeHash: code ? md5(code) : null,
        loginVerificationExpiresAt: code ? new Date(Date.now() + 5 * 60 * 1000) : null
      });

      const saved = await newUser.save();

      if (shouldVerifyEmail) {
        await authEmail.sendSignupVerificationEmail(saved.email, code);
        ctx.status = 201;
        ctx.body = {
          message: "Verification code sent",
          requiresVerification: true,
          login: saved.login
        };
        return;
      }

      const ret = token.createToken(saved.firstName, saved.lastName, saved._id);

      ctx.status = 201;
      ctx.body = ret;

    } catch (e) {
      console.error("Register error:", e);

      if (e.name === 'ValidationError') {
        ctx.status = 400;
        ctx.body = { error: e.message };
        return;
      }

      if (e.code === 11000) {
        ctx.status = 409;
        ctx.body = { error: 'Duplicate field value' };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  server.router.post('/api/verify-signup', koaBody(), async (ctx) => {
    try {
      const { login, code } = ctx.request.body || {};
      const user = await User.findOne({ login: login });

      if (!user) {
        ctx.status = 404;
        ctx.body = { error: "User not found" };
        return;
      }

      if (user.isEmailVerified) {
        ctx.status = 200;
        ctx.body = token.createToken(user.firstName, user.lastName, user._id);
        return;
      }

      if (!user.loginVerificationCodeHash || !user.loginVerificationExpiresAt) {
        ctx.status = 400;
        ctx.body = { error: "No verification code requested" };
        return;
      }

      if (user.loginVerificationExpiresAt < new Date()) {
        user.loginVerificationCodeHash = null;
        user.loginVerificationExpiresAt = null;
        await user.save();
        ctx.status = 400;
        ctx.body = { error: "Verification code expired" };
        return;
      }

      if (md5(code) !== user.loginVerificationCodeHash) {
        ctx.status = 400;
        ctx.body = { error: "Invalid verification code" };
        return;
      }

      user.isEmailVerified = true;
      user.loginVerificationCodeHash = null;
      user.loginVerificationExpiresAt = null;
      await user.save();

      ctx.status = 200;
      ctx.body = token.createToken(user.firstName, user.lastName, user._id);
    } catch (e) {
      console.error("api/verify-signup", e);
      ctx.status = 503;
      ctx.body = { error: "Unable to verify signup." };
    }
  });

  server.router.post('/api/add-match-history', authenticateToken, koaBody(), async(ctx) => {
    try{

      const gameTime = new Date();

      const {userId, players, winners, losers, timeFinished} = ctx.request.body;

      if (!players || !Array.isArray(players) || players.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Players field is required and must be a non-empty array' };
        return;
      }

      if (!winners || !Array.isArray(winners) || winners.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Winners field is required and must be a non-empty array' };
        return;
      }

      if (!losers || !Array.isArray(losers) || losers.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Losers field is required and must be a non-empty array' };
        return;
      }

      if (gameTime.now < timeFinished){
        ctx.status = 400;
        ctx.body = { error: 'Game time finished not valid.' };
        return;
      }

      const playerNames = players.map(p => p.name).sort().join('|');
      const guid = `${playerNames}-${userId}-${timeFinished}`;

      const newGame = new GameHistory({
        userId: userId,
        guid: guid,
        players: players, 
        winners: winners,
        losers: losers,
        timeFinished: timeFinished
      });

      await newGame.validate();
      await newGame.save();

      ctx.status = 201;
      ctx.body = { 
        message: 'Added match to match history' ,
        accessToken: ctx.state.refreshedToken
      };

    } catch(e){
      console.error("Register error:", e);

      if (e.name === 'ValidationError') {
        ctx.status = 400;
        ctx.body = { error: e.message };
        return;
      }

      if (e.code === 11000) {
        ctx.status = 201;
        ctx.body = { 
          message: 'Added match to match history' ,
          accessToken: ctx.state.refreshedToken
        };
        return;
      } 

      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  server.router.get('/api/fetch-match-history', authenticateToken, async(ctx) => {
      try {
          const userId = ctx.query.userId; 
        
          const games = await GameHistory.find({ "userId": userId })
              .sort({ date: -1 })
              .limit(5);
            
          if (games && games.length > 0) {
              ctx.status = 200;
              ctx.body = {
                  message: 'Successfully retrieved match history',
                  data: games,
                  accessToken: ctx.state.refreshedToken
              };
          } else {
              ctx.status = 200;
              ctx.body = { message: 'No games found', data: [] };
          }
      } catch(e) {
          console.error("Fetch match history error:", e);
          ctx.status = 500;
          ctx.body = { error: 'Internal server error' };
      }
  });
}
