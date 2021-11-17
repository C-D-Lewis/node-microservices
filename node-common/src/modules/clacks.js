const { WebSocket } = require('ws')
const log = require('./log');
const config = require('./config');

config.requireKeys('clacks.js', {
  required: ['CLACKS'],
  properties: {
    CLACKS: {
      required: ['SERVER', 'PORT', 'HOSTNAME'],
      properties: {
        SERVER: { type: 'string' },
        PORT: { type: 'number' },
        HOSTNAME: { type: 'string' },
      },
    },
  },
});

const {
  CLACKS: { SERVER, PORT, HOSTNAME },
} = config;

// Map of topic to callback
const subscriptions = {};

let socket;
let connected;

/**
 * Connect to the configured server.
 *
 * @returns {Promise<void>}
 */
const connect = async () => new Promise(resolve => {
  // Already connected? TODO: Reconnection?
  if (connected) {
    resolve();
    return;
  }

  socket = new WebSocket(`ws://${SERVER}:${PORT}`);

  socket.on('open', () => {
    log.debug('clacks: Connected');
    connected = true;
    resolve();
  });

  socket.on('message', (buffer) => {
    const { hostname, topic, data } = JSON.parse(buffer.toString());
    log.debug(`clacks << ${hostname} ${topic} ${data}`);

    // It's not for us
    if (hostname !== HOSTNAME) return;
    if (!subscriptions[topic]) return;

    // Pass to the application
    subscriptions[topic](data);
  });
});

/**
 * Close the connection.
 */
const disconnect = () => {
  if (!connected) throw new Error('clacks: not yet connected');

  socket.close();
  log.debug('clacks: Closed');
  connected = false;
};

/**
 * Subscribe to a message topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {function} onTopicMessage - Callback when a message with the matching topic is received.
 */
const subscribe = (topic, onTopicMessage) => {
  if (!connected) throw new Error('clacks: not yet connected');

  subscriptions[topic] = onTopicMessage;
};

/**
 * Send some JSON data to the server.
 *
 * @param {object} message - Message to send. 
 * @param {string} message.hostname - Hostname of the device to reach.
 * @param {string} message.topic - Topic to broadcast on.
 * @param {object} message.data - Data to send.
 */
const send = (message) => {
  if (!connected) throw new Error('clacks: not yet connected');
  
  log.debug(`clacks >> ${JSON.stringify(message)}`);
  socket.send(JSON.stringify(message));
};

// TODO: Remote host discoverability
// subscriptions.getHostname = () =>
//   send({ hostname: 'server', topic: 'getHostnameResponse', data: { hostname: HOSTNAME } });

module.exports = {
  connect,
  disconnect,
  subscribe,
  send,
};
