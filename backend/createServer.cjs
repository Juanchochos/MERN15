require('dotenv').config();
const { Server } = require('boardgame.io/server');
const { DominoGame } = require('./games/domino.js');
const mongoose = require('mongoose');
const api = require('./api.cjs');

function createServer() {
  const server = Server({
    games: [DominoGame],
    origins: ['http://localhost:5173', 'http://rickymetral.xyz'],
  });

  server.app.use(async (ctx, next) => {
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

  api.setApp(server, mongoose);

  return { server, mongoose };
}

module.exports = { createServer };