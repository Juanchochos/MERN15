require('dotenv').config();
const { Server } = require('boardgame.io/server');
const { DominoGame } = require('./games/domino.js');

const mongoose = require("mongoose");
// app.use(bodyParser.json());
const server = Server({
  games: [DominoGame],
  origins: ['http://localhost:5173', 'http://rickymetral.xyz'] // Vite's default port
})


const url = process.env.MONGODB_URI;
mongoose.connect(url)
  .then(() => console.log("Mongo DB connected"))
  .catch(err => console.log(err));

var api = require('./api.cjs');
api.setApp(server, mongoose );

server.app.use((req, res, next) => 
{
  app.get("/api/ping", (req, res, next) => {
	res.status(200).json({ message: "Hello World" });
  });
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

server.run(5000, () => console.log('Server on :5000'));
