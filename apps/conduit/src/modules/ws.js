const WebSocket = require('ws');

const { config, log } = require('../node-common')(['config', 'log']);

config.requireKeys('ws.js', {
  required: ['WS'],
  properties: {
    WS: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

const { WS: { PORT } } = config;

/**
 * 1. Server maps clients to hostnames after connection
 * 2. Server sends only to client with recipient hostname
 * 3. Transaction ID - Sender awaits another message for them with txId
 */

let server;
const knownClients = {};  // { id, hostname, client }

/**
 * Validate a message has the correct format.
 *
 * @param {object} json - JSON message received.
 */
const validatePacket = (json) => {
  const { to, topic, message } = json;

  if (!to) throw new Error('Packet missing to');
  if (!topic) throw new Error('Packet missing topic');
  if (!message) throw new Error('Packet missing message');
  if (typeof message !== 'object') throw new Error('message is not object');
};

/**
 * Broadcast data to all clients.
 *
 * @param {string} data - Data to send.
 * @returns {void}
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
    validatePacket(json);
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

  knownClients.push({
    id: Date.now(),
    hostname: '',
    client,
  });

  // Ask for hostname?
  // When same reconnects?

  client.on('message', (packet) => onClientMessage(client, packet));
};

/**
 * Start the WS server.
 */
const start = () => {
  server = new WebSocket.Server({ port: PORT });
  log.info(`WebSocket server listening on ${PORT}`);

  // Handle new connections
  server.on('connection', onNewClient);
};

/**
 * Stop the server.
 */
const stop = () => {
  log.info('Stopping WebSocket server');
  server.close();
};

module.exports = {
  start,
  stop,
};
