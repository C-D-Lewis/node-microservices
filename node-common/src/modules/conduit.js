const bodyParser = require('body-parser');
const express = require('express');
const request = require('request');

const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');
const schema = require('./schema');

config.requireKeys('conduit.js', {
  required: [ 'CONDUIT' ],
  type: 'object', properties: {
    CONDUIT: {
      required: [ 'HOST', 'PORT', 'APP' ],
      type: 'object', properties: {
        HOST: { type: 'string' },
        PORT: { type: 'number' },
        APP: { type: 'string' }
      }
    }
  }
});

const STATUS_MESSAGE_SCHEMA = { type: 'object' };
const RESPONSE_MESSAGE_SCHEMA = {
  additionalPrpoerties: false,
  required: [ 'status' ],
  type: 'object', properties: {
    status: { type: 'number' },
    message: { type: 'object' },
    error: { type: 'string' }
  }
};

let server;
const routes = []; // { topic, callback, schema }

// Client should modify input packet
const respond = async (res, packet) => {
  if(!schema(RESPONSE_MESSAGE_SCHEMA, packet)) {
    log.error(`conduit: respond() packet had schema errors`);
  }

  res.status(packet.status);
  res.send(packet);
};

// { to, from, topic, message }
const send = async (json) => {
  if(!server) throw new Error('conduit: Not yet registered');
  if(json.from) log.error('packet.from is unneccessary for conduit.send()');

  json.from = config.CONDUIT.APP;
  log.debug(`conduit: >> ${JSON.stringify(json)}`);
  const url = `http://${config.CONDUIT.HOST}:${config.CONDUIT.PORT}/conduit`;
  const data = await requestAsync({ 
    url, json,
    method: 'post'
  });
  
  log.debug(`conduit: << ${JSON.stringify(data.body)}`);
  return data.body;
};

const onMessage = (req, res) => {
  const { topic, message } = req.body;
  const route = routes.find(item => item.topic === topic);
  if(!route) {
    respond(res, {
      status: 404,
      error: 'Topic not found'
    });
    return;
  }

  if(!schema(message, route.schema)) {
    respond(res, {
      status: 400,
      error: 'Bad Request'
    });
    return;
  }

  route.callback(req.body, res);
};

const onStatus = (packet, res) => {
  respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};

const register = async () => {
  if(server) return;

  const { body } = await requestAsync({
    url: `http://${config.CONDUIT.HOST}:${config.CONDUIT.PORT}/port`,
    method: 'get',
    json: { app: config.CONDUIT.APP }
  });

  server = express();
  server.post('/conduit', bodyParser.json(), onMessage);

  return new Promise((resolve) => {
    server.listen(body.port, () => {
      log.debug(`conduit: Registered with Conduit on ${body.port}`);
      on('status', onStatus, STATUS_MESSAGE_SCHEMA);  
      resolve();
    });
  });
};

const on = (topic, callback, schema) => {
  if(routes.find(item => item.topic === topic)) return;

  routes.push({ topic, callback, schema });
};

module.exports = { 
  on, register, send, respond,
  isRegistered: () => server
};
