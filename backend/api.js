const token = require("./createJWT.js");
const User = require("./models/user.js");
const Card = require("./models/card.js");

exports.setApp = function (app, client) {
    
  app.post('/api/login', async (req, res) => {
    var error = '';
    const { login, password } = req.body;
    const results = await User.find({ Login: login, Password: password });
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