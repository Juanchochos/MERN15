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

      if (skipEmailVerification) {
        ctx.status = 200;
        ctx.body = token.createToken(user.firstName, user.lastName, user._id);
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

  server.router.post('/api/register', koaBody(), async (ctx) => {
    const { login, password, firstName, lastName, email } = ctx.request.body;

    try {
      const existing = await User.findOne({ login: login });

      if (existing) {
        ctx.status = 409;
        ctx.body = { error: "User Already Exists" };
        return;
      }

      const hash = md5(password);

       const newUser = new User({
        login: login,
        password: hash,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash
      });

      const saved = await newUser.save();

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

  server.router.post('/api/add-match-history', authenticateToken, koaBody(), async(ctx) => {
    try{
      const {players, winners, losers} = ctx.request.body;

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

      const newGame = new GameHistory({
        players: players, 
        winners: winners,
        losers: losers
      });

      const saved = await newGame.save();

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
        ctx.status = 409;
        ctx.body = { error: 'Duplicate field value' };
        return;
      }

      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  });

  server.router.post('/api/fetch-match-history', authenticateToken, koaBody(), async(ctx) => {
    try{
      const { userId } = ctx.request.body;

      const games = await GameHistory.find({ "players.userId": userId }).sort({date: -1}).limit(5);

      if(games && games.length > 0){
        ctx.status = 200;
        ctx.body = { 
          message: 'Succesfully retrieved match history' ,
          data: games,
          accessToken: ctx.state.refreshedToken
        };
      }
      
      else{
        ctx.status = 200;
        ctx.body = { message: 'No games found', data: [] };
      }

    } catch(e){
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
}

