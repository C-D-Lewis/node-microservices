const { WebSocket } = require('ws')
const log = require('./log');
const config = require('./config');
const ip = require('./ip');

config.requireKeys('clacks.js', {
  required: ['CLACKS'],
  properties: {
    CLACKS: {
      required: ['SERVER', 'PORT', 'HOSTNAME'],
      properties: {
        SERVER: {
          type: 'string',
          description: 'Clacks server to connect to',
        },
        PORT: {
          type: 'number',
          description: 'WebSocket port to connect to',
        },
        HOSTNAME: {
          type: 'string',
          description: 'Device unique name to respond to /global/getHostnames'
        },
      },
    },
  },
});

const {
  CLACKS: { SERVER, PORT, HOSTNAME },
} = config;

/** Get hostnames topic */
const TOPIC_GLOBAL_GET_HOSTNAMES = '/global/getHostnames';
/** Get hostnames response topic */
const TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE = '/global/getHostnamesResponse';
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 10000;

// Map of topic to callback
const subscriptions = {};

let socket;
let connected;
let heartbeatHandle;

/**
 * Start heartbeat loop.
 */
const startHeartbeat = () => {
  const thisDeviceTopic = `/devices/${HOSTNAME}/heartbeat`;

  clearInterval(heartbeatHandle);
  heartbeatHandle = setInterval(() => {
    socket.send(JSON.stringify({ topic: thisDeviceTopic, data: {} }));
  }, HEARTBEAT_INTERVAL_MS);
};

/**
 * Connect to the configured server.
 *
 * @returns {Promise<void>}
 */
const connect = async () => new Promise(resolve => {
  // Already connected?
  if (connected) {
    log.error('Warning: Already connected to clacks');
    return;
  }

  socket = new WebSocket(`ws://${SERVER}:${PORT}`);

  socket.on('open', () => {
    log.debug('clacks: connected');
    connected = true;

    startHeartbeat();
    resolve();
  });

  socket.on('message', (buffer) => {
    const { topic, data } = JSON.parse(buffer.toString());
    log.debug(`clacks << ${topic} ${JSON.stringify(data)}`);

    if (!subscriptions[topic]) return;

    // Pass to the application
    subscriptions[topic](data);
  });

  socket.on('close', () => {
    connected = false;
    log.debug('clacks: closed - retrying in 5s');
    setTimeout(connect, 5000);
  });

  socket.on('error', (err) => {
    log.error(err);
    log.debug('clacks: errored - closing');
    socket.close();
  });
});

/**
 * Close the connection.
 */
const disconnect = () => {
  if (!connected) throw new Error('clacks: not yet connected');

  socket.close();
  connected = false;
  log.debug('clacks: Closed');
};

/**
 * Subscribe to a message topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {function} onTopicMessage - Callback when a message with the matching topic is received.
 */
const subscribeTopic = (topic, onTopicMessage) => {
  if (!connected) throw new Error('clacks: not yet connected');

  subscriptions[topic] = onTopicMessage;
};

/**
 * Send some JSON data to the server.
 *
 * @param {string} topic - Topic to broadcast on.
 * @param {object} data - Data to send.
 */
const send = (topic, data = {}) => {
  if (!connected) throw new Error('clacks: not yet connected');
  
  const message = { topic, data };
  log.debug(`clacks >> ${JSON.stringify(message)}`);
  socket.send(JSON.stringify(message));
};

/**
 * Subscribe for hostnames received from other devices.
 *
 * @param {function} onHostnameResponse - When a hostname response message arrives.
 */
const subscribeHostnames = (onHostnameResponse) =>
  subscribeTopic(
    TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE,
    (data) => onHostnameResponse(data.hostname)
  );

/**
 * Request devices to send hostnames.
 */
const requestHostnames = () => send(TOPIC_GLOBAL_GET_HOSTNAMES);

// Remote host discoverability
subscriptions[TOPIC_GLOBAL_GET_HOSTNAMES] = async () =>
  send(
    TOPIC_GLOBAL_GET_HOSTNAMES_RESPONSE,
    { hostname: HOSTNAME, localIp: await ip.getLocal() },
  );

module.exports = {
  connect,
  disconnect,
  send,
  subscribeTopic,
  subscribeHostnames,
  requestHostnames,
};
