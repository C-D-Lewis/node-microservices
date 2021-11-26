const WebSocket = require('ws');

const { config, log } = require('../node-common')(['config', 'log']);

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

const { SERVER: { PORT } } = config;

let server;

/**
 * Validate a message has the correct format.
 *
 * @param {object} json - JSON message received.
 */
const validateMessage = (json) => {
  const { topic, data } = json;

  if (!topic) throw new Error('Message missing topic');
  if (!data) throw new Error('Message missing data');
  if (typeof data !== 'object') throw new Error('data is not object');
};

/**
 * Broadcast data to all clients.
 *
 * @param {string} data - Data to send
 */
const broadcast = (data) => server.clients.forEach((p) => p.send(data));

/**
 * When a client sends a message.
 *
 * @param {object} client - Client that sent the message.
 * @param {ArrayBuffer} data - The message.
 */
const onClientMessage = (client, data) => {
  log.debug(`message: ${data}`);

  // Ensure it has the right data
  let json;
  try {
    json = JSON.parse(data.toString());
    validateMessage(json);
  } catch (e) {
    log.error(e);
    return;
  }

  // Re-broadcast message to all clients
  broadcast(data);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 */
const onNewClient = (client) => {
  log.info('New client connected');

  client.on('message', (data) => onClientMessage(client, data));
};

/**
 * Start the WS server.
 */
const start = () => {
  server = new WebSocket.Server({ port: PORT });
  log.info(`Server listening on ${PORT}`);

  // Handle new connections
  server.on('connection', onNewClient);
};

/**
 * Stop the server.
 */
const stop = () => {
  log.info('Stopping server');
  server.close();
};

module.exports = {
  start,
  stop,
};
