const WebSocket = require('ws');
const { log } = require('../node-common')(['log']);

/** Fixed Norse port */
const PORT = 3918;
/** Client declaring hostname */
const TOPIC_GLOBAL_MYHOSTNAME = '/global/myHostname';

let server;
const clients = [];

/**
 * Validate a message has the correct format.
 *
 * @param {object} json - JSON message received.
 * @throws {Error} if message is invalid.
 */
const validateMessage = (json) => {
  const { route, message } = json;

  // Basic structure
  if (!route) throw new Error('Message missing route');
  if (!message) throw new Error('Message missing message');
  if (typeof message !== 'object') throw new Error('message is not object');

  // Valid route - either /devices/$NAME/$APP/$TOPIC or /global/*
  if (!route.includes('/global/') || route.split('/').length === 4) throw new Error('Invalid route');
};

/**
 * Handle a packet.
 *
 * @param {object} json - Received message data.
 */
const handlePacket = (json) => {
  const { route, message } = json;

  // Global?

  // Destined for a given device app route
  const [, device, app, topic] = route.split('/');
};

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

  // Client declaring hostname
  const { route, message } = json;
  if (route === TOPIC_GLOBAL_MYHOSTNAME) {
    const { hostname } = message;
    // eslint-disable-next-line no-param-reassign
    client.hostname = hostname;
    return;
  }

  // Handle packet, getting it where it needs to go
  handlePacket(json);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 */
const onNewClient = (client) => {
  log.info('New client connected');

  client.on('message', (data) => onClientMessage(client, data));

  // TODO: When to evict?
  clients.push(client);
};

/**
 * Start the WebSocket server.
 *
 * @returns {Promise<void>}
 */
const startServer = async () => {
  server = new WebSocket.Server({ port: PORT });
  log.info(`Server listening on ${PORT}`);

  // Handle new connections
  server.on('connection', onNewClient);
};

/**
 * Stop the server.
 */
const stopServer = () => {
  log.info('Stopping server');
  server.close();
};

module.exports = {
  startServer,
  stopServer,
};
