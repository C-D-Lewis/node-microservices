/* eslint-disable no-param-reassign */
const WebSocket = require('ws');
const { log, bifrost } = require('../node-common')(['log', 'bifrost']);

const {
  PORT,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,
} = bifrost;

const clients = [];
let server;

/**
 * Validate a message has the correct format.
 *
 * @param {object} json - JSON message received.
 * @throws {Error} if message is invalid.
 */
const validateMessage = (json) => {
  const { route, message } = json;

  // Basic structure
  if (!route) throw new Error('Message missing .route');
  if (!message) throw new Error('Message missing .message');
  if (typeof message !== 'object') throw new Error('.message is not object');

  // Validate route
  bifrost.parseRoute(route);
};

/**
 * Handle a packet.
 *
 * @param {object} packet - Received message data.
 */
const handlePacket = (packet) => {
  const { route } = packet;
  const {
    hostname, toApp,
  } = bifrost.parseRoute(route);

  // TODO From another device or browser?

  // Destined for a given local app route
  const target = clients.find((p) => p.appName === toApp);
  if (!target) {
    log.error(`Unknown: ${hostname}/${toApp}`);

    // Send error response to sender
    bifrost.reply(packet, { error: 'Not Found' });
    return;
  }

  // Forward to that host and app
  target.send(JSON.stringify(packet));
  log.debug(`FWD ${hostname}/${toApp}`);
};

/**
 * When a client sends a message.
 *
 * @param {object} client - Client that sent the message.
 * @param {ArrayBuffer} data - The message.
 */
const onClientMessage = (client, data) => {
  log.debug(`REC ${data}`);
  client.lastSeen = Date.now();

  // Ensure it has the right data
  let packet;
  try {
    packet = JSON.parse(data.toString());
    validateMessage(packet);
  } catch (e) {
    log.error(e);
    return;
  }

  const { route } = packet;
  const { topic, hostname, fromApp } = bifrost.parseRoute(route);

  // TODO guestlist integration for auth

  // Client declaring hostname and app name (unique combination)
  if (topic === TOPIC_WHOAMI) {
    // Annotate this client
    client.hostname = hostname;
    client.appName = fromApp;
    return;
  }

  // Ignore heartbeats received
  if (topic === TOPIC_HEARTBEAT) return;

  // Handle packet, getting it where it needs to go
  handlePacket(packet);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 */
const onNewClient = (client) => {
  log.info('New client connected');
  clients.push(client);

  client.on('message', (data) => onClientMessage(client, data));
  client.on('close', () => {
    clients.splice(clients.indexOf(client));
    log.info(`Client ${client.hostname}/${client.appName} closed connection`);
  });
};

/**
 * Start the WebSocket server.
 */
const startServer = () => {
  server = new WebSocket.Server({ port: PORT });
  server.on('connection', onNewClient);

  log.info(`Server listening on ${PORT}`);
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
