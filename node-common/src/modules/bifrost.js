const { WebSocket } = require('ws');
const { hostname } = require('os');
const log = require('./log');
const config = require('./config');

const { BIFROST: { SERVER, APP_NAME } } = config.withSchema('bifrost.js', {
  required: ['BIFROST'],
  properties: {
    BIFROST: {
      required: ['SERVER', 'APP_NAME'],
      properties: {
        SERVER: {
          type: 'string',
          description: 'Host to connect to',
        },
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
const ROUTE_GLOBAL_WHOAMI = '/global/whoami';
/** Route for this device heartbeat */
const ROUTE_THIS_DEVICE_HEARTBEAT = `/devices/${HOSTNAME}/${APP_NAME}/heartbeat`;
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;

// Map of topic to callback
const subscriptions = {};

let socket;
let connected;
let disconnectRequested = false;
let heartbeatHandle;

/**
 * Start heartbeat loop.
 */
const startHeartbeat = () => {
  clearInterval(heartbeatHandle);
  heartbeatHandle = setInterval(() => {
    const message = { route: ROUTE_THIS_DEVICE_HEARTBEAT, message: {} };
    socket.send(JSON.stringify(message));
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Tell the server which device and app we are.
 */
const sendWhoAmI = () => {
  const message = { hostname: HOSTNAME, appName: APP_NAME };
  socket.send(JSON.stringify({ route: ROUTE_GLOBAL_WHOAMI, message }));
  log.debug(`bifrost.js: Sent whoami: ${JSON.stringify(message)}`);
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
    log.debug('bifrost.js: connected');
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
    const [, , , , topic] = route.split('/');
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
    log.debug('bifrost.js: errored - closing');
    socket.close();
  });
});

/**
 * Close the connection.
 */
const disconnect = () => {
  disconnectRequested = true;
  if (!connected) throw new Error('bifrost.js: not yet connected');

  socket.close();
  connected = false;
  log.debug('bifrost.js: Closed');
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

  // TODO Async compatible interface

  const route = `/devices/${HOSTNAME}/${APP_NAME}/${topic}`;
  const data = { route, message };
  log.debug(`bifrost >> ${JSON.stringify(data)}`);
  socket.send(JSON.stringify(data));
};

module.exports = {
  connect,
  disconnect,
  send,
  subscribeTopic,
};
