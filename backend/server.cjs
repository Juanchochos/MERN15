require('dotenv').config();
const { Server } = require('boardgame.io/server');
const { DominoGame } = require('./games/domino.js');

const mongoose = require("mongoose");
const server = Server({
  games: [DominoGame],
  origins: ['http://localhost:5173', 'http://rickymetral.xyz']
})


const url = process.env.MONGODB_URI;
mongoose.connect(url)
  .then(() => console.log("Mongo DB connected"))
  .catch(err => console.log(err));

var api = require('./api.cjs');

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

server.app.use(server.router.routes());
server.app.use(server.router.allowedMethods());

api.setApp(server, mongoose );



const PORT = process.env.PORT || 8000;
server.run(PORT, () => console.log(`Server on :${PORT}`));
