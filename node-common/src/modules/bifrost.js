const { WebSocket } = require('ws');
const { hostname } = require('os');
const log = require('./log');
const config = require('./config');

const {
  BIFROST: { SERVER },
  LOG: { APP_NAME },
} = config.withSchema('bifrost.js', {
  required: ['BIFROST', 'LOG'],
  properties: {
    BIFROST: {
      required: ['SERVER'],
      properties: {
        SERVER: {
          type: 'string',
          description: 'Host to connect to',
        },
      },
    },
    LOG: {
      required: ['APP_NAME'],
      properties: {
        APP_NAME: {
          type: 'string',
          description: 'Name of the app on this device',
        },
      },
    },
  },
});

/** This hostname */
const HOSTNAME = hostname();
/** Fixed Norse port */
const PORT = 3918;
/** Client declaring itself */
const TOPIC_WHOAMI = 'whoami';
/** Topic for heartbeat */
const TOPIC_HEARTBEAT = 'heartbeat';
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;

const topics = {};
const inflights = {};

let socket;
let connected;
let disconnectRequested = false;
let heartbeatHandle;

/**
 * Parse a bifrost route string.
 *
 * @param {string} route - Route string to parse.
 * @returns {object} Route semantic parts.
 * @throws {Error} if unexpected format.
 */
const parseRoute = (route) => {
  const parts = route.split('/');
  if (!(route.includes('/global/') || parts.length === 6)) throw new Error('Invalid route');

  const [, type, routeHostname, fromApp, toApp, topic] = route.split('/');
  return {
    type,
    hostname: routeHostname,
    fromApp,
    toApp,
    topic,
    isGlobal: type === 'global',
  };
};

/**
 * Build a route string for a topic message from this device.
 *
 * @param {string} topic - Topic to use.
 * @param {string} [toApp] - Override toApp.
 * @returns {string} Route string.
 */
const buildRoute = (topic, toApp = APP_NAME) => `/devices/${HOSTNAME}/${APP_NAME}/${toApp}/${topic}`;

/**
 * Stop heartbeats.
 */
const stopHearbeat = () => {
  clearInterval(heartbeatHandle);
  log.debug('bifrost.js: Stopped heartbeats');
};

/**
 * Start heartbeat loop to keepalive connection.
 */
const startHeartbeat = () => {
  stopHearbeat();

  heartbeatHandle = setInterval(() => {
    const message = { route: buildRoute(TOPIC_HEARTBEAT), message: {} };
    socket.send(JSON.stringify(message));
    log.debug('bifrost.js: Sent heartbeat');
  }, HEARTBEAT_INTERVAL_MS);
  log.debug('bifrost.js: Began heartbeats');
};

/**
 * Tell the server which device and app we are.
 */
const sendWhoAmI = () => {
  socket.send(JSON.stringify({ route: buildRoute(TOPIC_WHOAMI), message: {} }));
  log.debug('bifrost.js: Sent whoami');
};

/**
 * Expect messages on a given topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {Function} onTopicMessage - Callback when a message with the matching topic is received.
 */
const registerTopic = (topic, onTopicMessage) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  topics[topic] = onTopicMessage;
  log.debug(`Added topic ${topic}`);
};

/**
 * Connect to the configured server.
 *
 * @returns {Promise<void>}
 */
const connect = async () => new Promise((resolve) => {
  // Already connected?
  if (connected) {
    log.error('Warning: Already connected to bifrost');
    return;
  }

  disconnectRequested = false;
  socket = new WebSocket(`ws://${SERVER}:${PORT}`);

  // When connection established
  socket.on('open', () => {
    log.info('bifrost.js: connected');
    connected = true;

    registerTopic('ping', () => ({ pong: true }));
    sendWhoAmI();
    startHeartbeat();
    resolve();
  });

  // When a message is received
  socket.on('message', async (buffer) => {
    const { id, route, message } = JSON.parse(buffer.toString());
    log.debug(`bifrost << ${id} ${route} ${JSON.stringify(message)}`);
    const { fromApp, topic } = parseRoute(route);
    console.log({topics, id, inflights})

    // Ignore if nobody is listening locally
    if (!topics[topic]) return;

    pinging self resolves immediately...

    // Did we request this message response? Resolve the send()!
    if (id && inflights[id]) {
      console.log('callback')
      inflights[id](message);
      delete inflights[id];
      return;
    }

    // Pass to the application and allow it to return a response for this ID
    const response = (await topics[topic](message)) || { ok: true };
    console.log({ response })

    // Send response to requester
    const responseRoute = buildRoute(topic, fromApp);
    const responsePacket = {
      id,
      route: responseRoute,
      message: response,
    };
    socket.send(JSON.stringify(responsePacket));
    log.debug(`bifrost <> ${id} ${route} ${JSON.stringify(responsePacket)}`);
  });

  // When connection is closed
  socket.on('close', () => {
    connected = false;
    log.debug('bifrost.js: closed');

    // Retry unless explicitly disconnected
    if (!disconnectRequested) setTimeout(connect, 5000);
  });

  socket.on('error', (err) => {
    log.error(err);
    log.error('bifrost.js: errored - closing');
    socket.close();
  });
});

/**
 * Close the connection.
 */
const disconnect = () => {
  disconnectRequested = true;
  if (!connected) throw new Error('bifrost.js: not yet connected');

  stopHearbeat();
  socket.close();
  connected = false;
  log.info('bifrost.js: disconnected');
};

/**
 * Send a packet to the server for another local application.
 * ID is attached to allow awaiting of other app's response data, so it can be
 * used in the same way as HTTP.
 *
 * @param {string} topic - Topic to broadcast on.
 * @param {object} message - Data to send.
 * @returns {Promise<object>} Response message data.
 */
const send = (topic, message = {}) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  const id = `${Date.now() + Math.random()}`;
  const packet = {
    id,
    route: buildRoute(topic),
    message,
  };
  log.debug(`bifrost >> ${JSON.stringify(packet)}`);
  socket.send(JSON.stringify(packet));

  // TODO reject on timeout
  return new Promise((resolve) => {
    inflights[id] = resolve;
  });
};

module.exports = {
  PORT,
  HEARTBEAT_INTERVAL_MS,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,

  connect,
  disconnect,
  send,
  registerTopic,
  parseRoute,
};
