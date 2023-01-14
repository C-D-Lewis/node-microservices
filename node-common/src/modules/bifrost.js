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

// Map of topic to callback
const subscriptions = {};

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
  if (!(route.includes('/global/') || parts.length === 5)) throw new Error('Invalid route');

  const [, type, routeHostname, appName, topic] = route.split('/');
  return {
    type,
    hostname: routeHostname,
    appName,
    topic,
    isGlobal: type === 'global',
  };
};

/**
 * Build a route string for a topic message from this device.
 *
 * @param {string} topic - Topic to use.
 * @returns {string} Route string.
 */
const buildRoute = (topic) => `/devices/${HOSTNAME}/${APP_NAME}/${topic}`;

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

    sendWhoAmI();
    startHeartbeat();
    resolve();
  });

  // When a message is received
  socket.on('message', (buffer) => {
    const { route, message } = JSON.parse(buffer.toString());
    log.debug(`bifrost << ${route} ${JSON.stringify(message)}`);

    // Ignore if nobody is listening locally
    const { topic } = parseRoute(route);
    if (!subscriptions[topic]) return;

    // Pass to the application
    subscriptions[topic](message);
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
 * Subscribe to a message topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {Function} onTopicMessage - Callback when a message with the matching topic is received.
 */
const subscribeTopic = (topic, onTopicMessage) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  subscriptions[topic] = onTopicMessage;
  log.debug(`Added subscription to ${topic}`);
};

/**
 * Send some JSON data to the server for another local application.
 *
 * @param {string} topic - Topic to broadcast on.
 * @param {object} message - Data to send.
 * @returns {void}
 */
const send = (topic, message = {}) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  // TODO const res = await send()...

  const route = buildRoute(topic);
  const data = { route, message };
  log.debug(`bifrost >> ${JSON.stringify(data)}`);
  socket.send(JSON.stringify(data));
};

module.exports = {
  PORT,
  HEARTBEAT_INTERVAL_MS,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,

  connect,
  disconnect,
  send,
  subscribeTopic,
  parseRoute,
};
