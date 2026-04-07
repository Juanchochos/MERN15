const token = require("./src/createJWT.cjs");
const User = require("./models/user.cjs");
const Card = require("./models/card.cjs");
const md5 = require("md5");
const { koaBody } = require("koa-body");
const authEmail = require("./services/auth_email.cjs");


exports.setApp = function (server, client) {

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

  server.router.post('/api/addcard', koaBody(), async (ctx) => {
    const { userId, card, jwtToken } = ctx.request.body;

    if (token.isExpired(jwtToken)) {
      ctx.status = 200;
      ctx.body = { error: 'The JWT is no longer valid', jwtToken: '' };
      return;
    }

    let error = '';

    try {
      const newCard = new Card({ Card: card, UserId: userId });
      await newCard.save();
    } catch (e) {
      error = e.toString();
    }

    const refreshedToken = token.refresh(jwtToken);

    ctx.status = 201;
    ctx.body = { error, jwtToken: refreshedToken };
  });

  server.router.post('/api/searchcards', koaBody(), async (ctx) => {
    const { userId, search, jwtToken } = ctx.request.body;

    if (token.isExpired(jwtToken)) {
      ctx.status = 200;
      ctx.body = { error: 'The JWT is no longer valid', jwtToken: '' };
      return;
    }

    const _search = search.trim();

    const results = await Card.find({
      Card: { $regex: _search + '.*', $options: 'i' }
    });

    const _ret = results.map(r => r.Card);

    const refreshedToken = token.refresh(jwtToken);

    ctx.status = 200;
    ctx.body = { results: _ret, error: '', jwtToken: refreshedToken };
  });

  server.app.use(server.router.routes());
  server.app.use(server.router.allowedMethods());
};
