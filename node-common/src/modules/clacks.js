const { WebSocket } = require('ws');
const { hostname } = require('os');
const log = require('./log');
const config = require('./config');
const ip = require('./ip');

config.requireKeys('clacks.js', {
  required: ['CLACKS'],
  properties: {
    CLACKS: {
      required: ['SERVER'],
      properties: {
        SERVER: {
          type: 'string',
          description: 'Clacks server to connect to',
        },
      },
    },
  },
});

const {
  CLACKS: { SERVER },
} = config;

/** Get hostnames topic */
const TOPIC_GLOBAL_GET_HOSTNAMES = '/global/getHostnames';
/** Get hostnames response topic */
const TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE = '/global/getHostnamesResponse';
/** Topic for this device heartbeat */
const TOPIC_THIS_DEVICE_HEARTBEAT = `/devices/${hostname()}/heartbeat`;
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;
/** Fixed clacks port */
const PORT = 7777;

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
    const message = { topic: TOPIC_THIS_DEVICE_HEARTBEAT, data: {} };
    socket.send(JSON.stringify(message));
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Connect to the configured server.
 *
 * @returns {Promise<void>}
 */
const connect = async () => new Promise((resolve) => {
  // Already connected?
  if (connected) {
    log.error('Warning: Already connected to clacks');
    return;
  }

  disconnectRequested = false;
  socket = new WebSocket(`ws://${SERVER}:${PORT}`);

  // When connection established
  socket.on('open', () => {
    log.debug('clacks.js: connected');
    connected = true;

    startHeartbeat();
    resolve();
  });

  // When a message is received
  socket.on('message', (buffer) => {
    const { topic, data } = JSON.parse(buffer.toString());
    log.debug(`clacks << ${topic} ${JSON.stringify(data)}`);

    // Ignore if nobody is listening locally
    if (!subscriptions[topic]) return;

    // Pass to the application
    subscriptions[topic](data);
  });

  // When connection is closed
  socket.on('close', () => {
    connected = false;
    log.debug('clacks.js: closed');

    // Retry unless explicitly disconnected
    if (!disconnectRequested) setTimeout(connect, 5000);
  });

  socket.on('error', (err) => {
    log.error(err);
    log.debug('clacks.js: errored - closing');
    socket.close();
  });
});

/**
 * Close the connection.
 */
const disconnect = () => {
  disconnectRequested = true;
  if (!connected) throw new Error('clacks.js: not yet connected');

  socket.close();
  connected = false;
  log.debug('clacks.js: Closed');
};

/**
 * Subscribe to a message topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {Function} onTopicMessage - Callback when a message with the matching topic is received.
 */
const subscribeTopic = (topic, onTopicMessage) => {
  if (!connected) throw new Error('clacks.js: not yet connected');

  subscriptions[topic] = onTopicMessage;
};

/**
 * Send some JSON data to the server.
 *
 * @param {string} topic - Topic to broadcast on.
 * @param {object} data - Data to send.
 * @returns {void}
 */
const send = (topic, data = {}) => {
  if (!connected) throw new Error('clacks.js: not yet connected');

  const message = { topic, data };
  log.debug(`clacks >> ${JSON.stringify(message)}`);
  socket.send(JSON.stringify(message));
};

/**
 * Subscribe for hostnames received from other devices.
 *
 * @param {Function} onHostnameResponse - When a hostname response message arrives.
 * @returns {void}
 */
const subscribeHostnames = (onHostnameResponse) => subscribeTopic(
  TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE,
  (data) => onHostnameResponse(data.hostname),
);

/**
 * Request devices to send hostnames.
 *
 * @returns {void}
 */
const requestHostnames = () => send(TOPIC_GLOBAL_GET_HOSTNAMES);

// Remote host discoverability
/**
 * Built-in topic to respond to hostname requests
 */
subscriptions[TOPIC_GLOBAL_GET_HOSTNAMES] = async () => send(
  TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE,
  { hostname: hostname(), localIp: ip.getLocal() },
);

module.exports = {
  connect,
  disconnect,
  send,
  subscribeTopic,
  subscribeHostnames,
  requestHostnames,
};
