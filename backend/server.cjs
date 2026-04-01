require('dotenv').config();
const { Server } = require('boardgame.io/server');
const { DominoGame } = require('./games/domino.js');
const bodyParser = require('koa-bodyparser');

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

server.app.use(bodyParser())
server.app.use( async (ctx, next) => 
{
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  ctx.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  await next();
});

api.setApp(server, mongoose );



server.run(5000, () => console.log('Server on :5000'));
