const express = require('express');

const config = require('./config');
const schema = require('./schema');
const log = require('./log');

config.requireKeys('server.js', {
  required: [ 'SERVER' ],
  type: 'object', properties: {
    SERVER: {
      required: [ 'PORT' ],
      type: 'object', properties: {
        PORT: { type: 'number' }
      }
    }
  }
});

let app;

const respond = (res, code, body) => {
  res.status(code);
  res.send(body);
};

const start = () => {
  app = express();
  app.get('/status', (req, res) => module.exports.respondOk(res));
  app.listen(config.SERVER.PORT, () => log.info(`Express server up on ${config.SERVER.PORT}`));
};

module.exports = {
  start,
  getExpressApp: () => app,
  respondOk: res => respond(res, 200, 'OK\n'),
  respondBadRequest: res => respond(res, 400, 'Bad Request\n'),
  respondNotFound: res => respond(res, 404, 'Not Found\n')
};
