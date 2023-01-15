/* eslint-disable no-param-reassign */
const WebSocket = require('ws');
const { log, bifrost } = require('../node-common')(['log', 'bifrost']);

const {
  PORT,
  HEARTBEAT_INTERVAL_MS,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,
} = bifrost;

const clients = [];
let server;
let evictionHandle;

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
 * @param {object} client - Client who sent the received packet.
 */
const handlePacket = (packet, client) => {
  const { id, route } = packet;
  const {
    hostname, toApp, fromApp, topic,
  } = bifrost.parseRoute(route);

  // TODO From another device or browser?

  // Destined for a given host & app route
  const target = clients.find((p) => p.hostname === hostname && p.appName === toApp);
  if (!target) {
    log.error(`Unknown: ${hostname}>${toApp}`);

    // Send error response to sender
    const errResponse = {
      replyId: id,
      route: `/devices/${hostname}/bifrost/${fromApp}/${topic}`,
      message: { error: 'Not Found' },
    };
    client.send(JSON.stringify(errResponse));
    return;
  }

  // Forward to that host and app
  target.send(JSON.stringify(packet));
  log.debug(`FWD ${hostname}>${toApp}`);
};

/**
 * When a client sends a message.
 *
 * @param {object} client - Client that sent the message.
 * @param {ArrayBuffer} data - The message.
 */
const onClientMessage = (client, data) => {
  log.debug(`RECV ${data}`);
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
    log.debug(`whoami: ${hostname}>${fromApp}`);
    return;
  }

  // Ignore heartbeats received
  if (topic === TOPIC_HEARTBEAT) {
    log.debug(`heartbeat: ${hostname}>${fromApp}`);
    return;
  }

  // Handle packet, getting it where it needs to go
  handlePacket(packet, client);
};

/**
 * When a new client connects.
 *
 * @param {object} client - The newly connected client.
 */
const onNewClient = (client) => {
  log.info('New client connected');
  client.on('message', (data) => onClientMessage(client, data));
  clients.push(client);
};

/**
 * Begin checking for clients who we haven't been heard from in a while.
 */
const beginEvictionChecks = () => {
  clearInterval(evictionHandle);

  evictionHandle = setInterval(() => {
    const now = Date.now();
    clients.forEach((p) => {
      if (now - p.lastSeen < HEARTBEAT_INTERVAL_MS) return;

      clients.splice(clients.indexOf(p), 1);
      p.close();
      log.info(`Evicted ${p.hostname}>${p.appName} after ${HEARTBEAT_INTERVAL_MS}`);
    });
  }, HEARTBEAT_INTERVAL_MS);
  log.info('Began eviction checks');
};

/**
 * Start the WebSocket server.
 */
const startServer = () => {
  server = new WebSocket.Server({ port: PORT });
  server.on('connection', onNewClient);

  log.info(`Server listening on ${PORT}`);
  beginEvictionChecks();
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
