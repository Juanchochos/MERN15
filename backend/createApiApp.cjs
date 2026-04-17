require('dotenv').config();
const Koa = require('koa');
const Router = require('@koa/router');
const api = require('./api.cjs');
const mongoose = require('mongoose');

function createApiApp() {
    const app = new Koa();
    const router = new Router();
    const server = { app, router };
    api.setApp(server, mongoose);
    app.use(router.routes());
    app.use(router.allowedMethods());
    return app;
  }
  
  module.exports = { createApiApp };
