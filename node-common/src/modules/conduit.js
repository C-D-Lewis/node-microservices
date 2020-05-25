const bodyParser = require('body-parser');
const express = require('express');
const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');
const schema = require('./schema');

config.requireKeys('conduit.js', {
  required: ['CONDUIT'],
  properties: {
    CONDUIT: {
      required: ['HOST', 'PORT', 'APP'],
      properties: {
        HOST: { type: 'string' },
        PORT: { type: 'number' },
        APP: { type: 'string' },
        TOKEN: { type: 'string' },
      },
    },
  },
});

const STATUS_MESSAGE_SCHEMA = { type: 'object' };
const RESPONSE_MESSAGE_SCHEMA = {
  additionalPrpoerties: false,
  required: ['status'],
  properties: {
    status: { type: 'number' },
    message: { type: 'object' },
    error: { type: 'string' },
  },
};

// { topic, callback, schema }
const routes = [];
let server;

const respond = async (res, packet) => {
  if (!schema(RESPONSE_MESSAGE_SCHEMA, packet)) {
    log.error(`conduit: respond() packet from ${config.CONDUIT.APP} had schema errors`);
  }

  res.status(packet.status).send(packet);
};

// { to, from, topic, message }
const send = async (packet) => {
  if (!server) {
    throw new Error('conduit: Not yet registered');
  }

  // Patch extras in
  packet.from = config.CONDUIT.APP;
  packet.auth = config.CONDUIT.TOKEN || '';

  log.debug(`conduit: >> ${JSON.stringify(packet)}`);
  const { body } = await requestAsync({
    url: `http://${config.CONDUIT.HOST}:${config.CONDUIT.PORT}/conduit`,
    method: 'post',
    json: packet,
  });

  log.debug(`conduit: << ${JSON.stringify(body)}`);
  return body;
};

const onMessage = (req, res) => {
  const { topic, message } = req.body;
  log.debug(`<< ${topic} ${JSON.stringify(message)}`);

  const route = routes.find(item => item.topic === topic);
  if (!route) {
    respond(res, { status: 404, error: `Topic '${topic}' not found` });
    return;
  }

  if (!schema(message, route.schema)) {
    respond(res, { status: 400, error: 'Bad Request' });
    return;
  }

  route.callback(req.body, res);
};

const onStatus = (packet, res) => respond(res, { status: 200, message: { content: 'OK' } });

const register = async () => {
  if (server) {
    return;
  }

  const { body } = await requestAsync({
    url: `http://${config.CONDUIT.HOST}:${config.CONDUIT.PORT}/port`,
    json: { app: config.CONDUIT.APP },
  });

  server = express();
  server.post('/conduit', bodyParser.json(), onMessage);

  return new Promise((resolve) => {
    server.listen(body.port, () => {
      on('status', onStatus, STATUS_MESSAGE_SCHEMA);

      log.debug(`conduit: Registered with Conduit on ${body.port}`);
      resolve();
    });
  });
};

const on = (topic, callback, schema) => {
  if (routes.find(item => item.topic === topic)) {
    throw new Error(`Topic '${topic}' already registered!`);
  }

  routes.push({ topic, callback, schema });
};

module.exports = {
  on,
  register,
  send,
  respond,
  isRegistered: () => server,
};
