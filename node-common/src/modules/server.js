const express = require('express');
const config = require('./config');
const log = require('./log');

config.requireKeys('server.js', {
  required: ['SERVER'],
  properties: {
    SERVER: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

let app;

const respond = (res, code, body) => res.status(code).send(body);

const respondWithPid = res => res.status(200).json({ pid: process.pid });

const start = () => new Promise((resolve) => {
  app = express();

  // Default routes for all apps
  app.get('/status', (req, res) => module.exports.respondOk(res));
  app.get('/pid', (req, res) => respondWithPid(res));

  app.listen(config.SERVER.PORT, () => {
    log.info(`Express server up on ${config.SERVER.PORT}`);
    resolve();
  });
});

module.exports = {
  start,
  getExpressApp: () => app,
  respondOk: res => respond(res, 200, 'OK\n'),
  respondBadRequest: res => respond(res, 400, 'Bad Request\n'),
  respondNotFound: res => respond(res, 404, 'Not Found\n')
};
