const token = require("./createJWT.js");
const User = require("./models/user.js");
const Card = require("./models/card.js");
const md5 = require("md5")

exports.setApp = function (app, client) {

  app.post('/api/login', async (req, res) => {
    var error = '';
    const { login, password } = req.body;
    const hash  = md5(password);
    const results = await User.find({ Login: login, Password: hash});
    var id = -1; var fn = ''; var ln = '';
    var ret;
    if (results.length > 0) {
      id = results[0].UserId;
      fn = results[0].FirstName;
      ln = results[0].LastName;
      try {
        ret = token.createToken(fn, ln, id);
      } catch(e) {
        ret = { error: e.message };
      }
    } else {
      ret = { error: "Login/Password incorrect" };
    }
    res.status(200).json(ret);
  });

  app.post('/api/register', async (req, res) => {
    const { login, password, firstName, lastName, email} = req.body;
    var error = '';
    var ret;
    try{
      const existing = await User.findOne({Login: login});
      console.log("Exising: " + existing);
      if(existing != null){
        return res.status(409).json({error: "User Already Exists"});
      }
      const hash  = md5(password);
      const newUser = new User({
          login: login,
          password: hash,
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash
      });
      const saved = await newUser.save();
      ret = token.createToken(saved.firstName, saved.lastName, saved._id);
      res.status(201).json(ret);
    }
    catch (e) {
        console.error("Register error:", e);

        if (e.name === 'ValidationError') {
            return res.status(400).json({ error: e.message });
        }

        if (e.code === 11000) {
            return res.status(409).json({ error: 'Duplicate field value' });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/addcard', async (req, res) => {
    const { userId, card, jwtToken } = req.body;

    if (token.isExpired(jwtToken)) {
      return res.status(200).json({ error: 'The JWT is no longer valid', jwtToken: '' });
    }

    const newCard = new Card({ Card: card, UserId: userId });
    var error = '';
    try {
      await newCard.save();
    } catch(e) {
      error = e.toString();
    }

    const refreshedToken = token.refresh(jwtToken);
    res.status(200).json({ error, jwtToken: refreshedToken });
  });

  app.post('/api/searchcards', async (req, res) => {
    const { userId, search, jwtToken } = req.body;

    if (token.isExpired(jwtToken)) {
      return res.status(200).json({ error: 'The JWT is no longer valid', jwtToken: '' });
    }

    var _search = search.trim();
    const results = await Card.find({ "Card": { $regex: _search + '.*', $options: 'i' } });
    var _ret = results.map(r => r.Card);

    const refreshedToken = token.refresh(jwtToken);
    res.status(200).json({ results: _ret, error: '', jwtToken: refreshedToken });
  });
}