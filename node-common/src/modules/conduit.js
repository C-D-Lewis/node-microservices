/* eslint-disable no-param-reassign */

const bodyParser = require('body-parser');
const express = require('express');
const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');
const schema = require('./schema');

const { CONDUIT } = config.withSchema('conduit.js', {
  required: ['CONDUIT'],
  properties: {
    CONDUIT: {
      required: ['HOST', 'APP'],
      properties: {
        HOST: { type: 'string' },
        APP: { type: 'string' },
        TOKEN: { type: 'string' },
      },
    },
  },
});

/** Fixed conduit port */
const PORT = 5959;
/** Status message schema */
const STATUS_MESSAGE_SCHEMA = { type: 'object' };
/** Response message schema */
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
const registeredRoutes = [];
let server;

/**
 * Respond to a message.
 *
 * @param {object} res - Express response object.
 * @param {object} packet - Response packet.
 * @throws {Error} If packet to send does not conform to the schema.
 */
const respond = async (res, packet) => {
  if (!schema(RESPONSE_MESSAGE_SCHEMA, packet)) { throw new Error(`conduit.js: respond() packet from ${CONDUIT.APP} had schema errors`); }

  res.status(packet.status).send(packet);
};

/**
 * Send a conduit packet to another app.
 *
 * @param {object} packet - Conduit packet ({ to, from, topic, message })
 * @returns {object} Response body.
 * @throws {Error} If not yet registered with the conduit app.
 */
const send = async (packet) => {
  if (!server) throw new Error('conduit.js: Not yet registered');

  // Patch extras in
  packet.from = CONDUIT.APP;
  packet.auth = CONDUIT.TOKEN || '';

  // Send the data
  log.debug(`conduit.js: >> ${JSON.stringify(packet)}`);
  const { body } = await requestAsync({
    url: `http://${CONDUIT.HOST}:${PORT}/conduit`,
    method: 'post',
    json: packet,
  });

  log.debug(`conduit.js: << ${JSON.stringify(body)}`);
  return body;
};

/**
 * When a packet arrives from the local conduit app.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const onMessage = (req, res) => {
  const { topic, message } = req.body;
  log.debug(`<< ${topic} ${JSON.stringify(message)}`);

  // Check if this app cares about the packet
  const route = registeredRoutes.find((item) => item.topic === topic);
  if (!route) {
    respond(res, { status: 404, error: `Topic '${topic}' not found` });
    return;
  }

  // Not expected format
  if (!schema(message, route.schema)) {
    respond(res, { status: 400, error: `Bad Request: ${topic} data:${JSON.stringify(message)} schema:${JSON.stringify(route.schema)}` });
    return;
  }

  // Notify the app
  route.callback(req.body, res);
};

/**
 * When API stop request is received, kill this app.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
const onKill = (req, res) => {
  log.info('Process exit requested, shutting down in 3s');
  res.status(200).send({ stop: true });

  setTimeout(() => process.exit(), 3000);
};

/**
 * When a status packet is receieved.
 *
 * @param {object} packet - Conduit packet (unused).
 * @param {object} res - Express response object.
 * @returns {void}
 */
const onStatus = (packet, res) => respond(res, { status: 200, message: { content: 'OK' } });

/**
 * Register a conduit topic to be handled by this app.
 *
 * @param {string} topic - Topic name.
 * @param {Function} callback - Callback to handle messages on this topic.
 * @param {object} schm - Topic acceptable message JSON Schema.
 * @throws {Error} If this topic is already registered.
 */
const on = (topic, callback, schm) => {
  if (registeredRoutes.find((item) => item.topic === topic)) { throw new Error(`Topic '${topic}' already registered!`); }

  registeredRoutes.push({ topic, callback, schema: schm });
};

/**
 * Register this app with the local conduit instance.
 *
 * @returns {Promise} Resolves upon connection and port assignment.
 */
const register = async () => {
  // Already connected
  if (server) return undefined;

  // Request a random port to be known by
  const { body } = await requestAsync({
    url: `http://${CONDUIT.HOST}:${PORT}/port`,
    json: { app: CONDUIT.APP, pid: process.pid },
  });

  // Start a local HTTP server and add routes
  server = express();
  server.post('/conduit', bodyParser.json(), onMessage);
  server.post('/kill', onKill);

  return new Promise((resolve) => {
    // Listen on the assigned port
    server.listen(body.port, () => {
      // Register all apps to report their status
      on('status', onStatus, STATUS_MESSAGE_SCHEMA);

      log.debug(`conduit.js: Registered with Conduit on ${body.port}`);
      resolve();
    });
  });
};

module.exports = {
  on,
  register,
  send,
  respond,
  /**
   * Check if the server is registered.
   *
   * @returns {object} Server object if allocated.
   */
  isRegistered: () => server,
};
