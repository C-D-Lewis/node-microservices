/* eslint-disable no-param-reassign */
const WebSocket = require('ws');
const { log, bifrost } = require('../node-common')(['log', 'bifrost']);

const {
  PORT,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,
  TOPIC_KNOWN_APPS,
} = bifrost;

const clients = [];
let server;

/**
 * Handle a packet.
 *
 * @param {object} packet - Received message data.
 */
const handlePacket = (packet) => {
  const { to } = packet;

  // TODO From another device or browser?

  // Destined for a given local app route
  const target = clients.find((p) => p.appName === to);
  if (!target) {
    log.error(`Unknown: ${to}`);

    // Send error response to sender
    bifrost.reply(packet, { error: 'Not Found' });
    return;
  }

  // Forward to that host and app
  target.send(JSON.stringify(packet));
  log.debug(`FWD ${to}`);
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
    bifrost.validatePacket(packet);
  } catch (e) {
    log.error(e);
    return;
  }

  const { from, topic } = packet;

  // TODO guestlist integration for auth

  // Client declaring app name (unique combination)
  if (topic === TOPIC_WHOAMI) {
    // Annotate this client
    client.appName = from;
    return;
  }

  // Ignore heartbeats received
  if (topic === TOPIC_HEARTBEAT) return;

  // Provide connected apps
  if (TOPIC_KNOWN_APPS) {
    const apps = clients.map((p) => p.appName);
    bifrost.reply(packet, { apps });
    return;
  }

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
    log.info(`Client ${client.appName} closed connection`);
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
