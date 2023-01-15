const { WebSocket } = require('ws');
const { hostname } = require('os');
const log = require('./log');
const config = require('./config');
const schema = require('./schema');

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
/** Send tmeout */
const SEND_TIMEOUT_MS = 15000;

const topics = {};
const pending = {};

let socket;
let connected;
let disconnectRequested = false;
let heartbeatHandle;
let thisAppName = APP_NAME; // Could be overridden

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
  };
};

/**
 * Build a route string for a topic message from this device.
 *
 * @param {string} topic - Topic to use.
 * @param {string} toApp - App sending to.
 * @param {string} [fromApp] - Override fromApp.
 * @returns {string} Route string.
 */
const buildRoute = (topic, toApp, fromApp = thisAppName) => `/devices/${HOSTNAME}/${fromApp}/${toApp}/${topic}`;

/**
 * Stop heartbeats.
 */
const stopHearbeats = () => {
  clearInterval(heartbeatHandle);
  log.debug('bifrost.js: Stopped heartbeats');
};

/**
 * Start heartbeat loop to keepalive connection.
 */
const startHeartbeats = () => {
  stopHearbeats();

  heartbeatHandle = setInterval(() => {
    socket.send(JSON.stringify({ route: buildRoute(TOPIC_HEARTBEAT, 'bifrost'), message: {} }));
    log.debug('bifrost.js: Sent heartbeat');
  }, HEARTBEAT_INTERVAL_MS);
  log.debug('bifrost.js: Began heartbeats');
};

/**
 * Tell the server which device and app we are.
 */
const sendWhoAmI = () => {
  socket.send(JSON.stringify({ route: buildRoute(TOPIC_WHOAMI, 'bifrost'), message: {} }));
  log.debug('bifrost.js: Sent whoami');
};

/**
 * Expect messages on a given topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {Function} cb - Callback when a message with the matching topic is received.
 * @param {object} topicSchema - Schema for topic messages.
 */
const registerTopic = (topic, cb, topicSchema) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');
  if (!topicSchema) throw new Error('Topics require schema');

  topics[topic] = { cb, topicSchema };
  log.debug(`Added topic '${topic}'`);
};

/**
 * Send a reply to a received packet with an 'id'.
 *
 * @param {object} packet - Packet received.
 * @param {object} message - Response data.
 */
const reply = async (packet, message) => {
  const { id, route } = packet;
  const { topic, fromApp } = parseRoute(route);
  if (!id) throw new Error('Cannot reply to packet with no id');

  // Reply to sender
  const payload = {
    replyId: id,
    route: buildRoute(topic, fromApp),
    message,
  };
  socket.send(JSON.stringify(payload));
  log.debug(`bifrost.js: <> ${id} ${route} ${JSON.stringify(payload)}`);
};

/**
 * When connection is open.
 *
 * @param {Function} resolve - Callback for the app.
 */
const onConnected = (resolve) => {
  log.info('bifrost.js: connected');
  connected = true;
  disconnectRequested = false;

  registerTopic('status', () => ({ content: 'OK' }), {});
  sendWhoAmI();
  startHeartbeats();
  resolve();
};

/**
 * When the socket receives a message.
 *
 * @param {*} buffer - Data buffer.
 * @returns {Promise<void>}
 */
const onSocketMessage = async (buffer) => {
  const packet = JSON.parse(buffer.toString());
  const {
    id, replyId, route, message,
  } = packet;
  log.debug(`bifrost.js: << ${id}/${replyId} ${route} ${JSON.stringify(message)}`);
  const { topic } = parseRoute(route);

  // Did we request this message response? Resolve the send()!
  if (replyId && pending[replyId]) {
    pending[replyId](message);
    delete pending[replyId];
    return;
  }

  // Topic does not exist in the app
  const found = topics[topic];
  if (!found) {
    log.error(`bifrost.js: No topic registered for ${topic}`);
    return;
  }

  // Check topic schema
  const { topicSchema, cb } = found;
  if (!schema(message, topicSchema)) {
    log.error(`bifrost.js: Schema failed:\n${JSON.stringify(topicSchema)}\n${JSON.stringify(message)}`);
    return;
  }

  // Pass to the application and allow it to return a response for this ID
  const responseMessage = (await cb(packet)) || { ok: true };
  reply(packet, responseMessage);
};

/**
 * Connect to the configured server.
 *
 * @param {object} [opts] - Function opts.
 * @param {string} [opts.appName] - Override this app name.
 * @returns {Promise<void>}
 */
const connect = async ({ appName } = {}) => new Promise((resolve) => {
  if (connected) {
    log.error('bifrost.js: Warning: Already connected to bifrost');
    return;
  }

  if (appName) {
    thisAppName = appName;
    log.debug(`Overridden app name: ${thisAppName}`);
  }

  socket = new WebSocket(`ws://${SERVER}:${PORT}`);
  socket.on('open', () => onConnected(resolve));
  socket.on('message', onSocketMessage);
  socket.on('close', () => {
    connected = false;
    log.debug('bifrost.js: closed');

    // Reconnect unless explicitly disconnected
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
  if (!connected) throw new Error('bifrost.js: not yet connected');

  disconnectRequested = true;
  stopHearbeats();
  socket.close();
  connected = false;
  log.info('bifrost.js: disconnected');
};

/**
 * Send a packet to the server for another local application.
 * ID is attached to allow awaiting of other app's response data, so it can be
 * used in the same way as HTTP.
 *
 * @param {object} opts - Function opts.
 * @param {string} opts.toApp - App to send to.
 * @param {string} opts.topic - Topic to broadcast on.
 * @param {object} [opts.message] - Data to send.
 * @param {string} [opts.fromApp] - Override fromApp.
 * @returns {Promise<object>} Response message data.
 */
const send = ({
  toApp, topic, message = {}, fromApp,
}) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  // Send this message to the chosen app
  const id = `${Date.now() + Math.round(Math.random() * 10000)}`;
  const packet = {
    id,
    route: buildRoute(topic, toApp, fromApp),
    message,
  };
  log.debug(`bifrost.js: >> ${JSON.stringify(packet)}`);
  socket.send(JSON.stringify(packet));

  // Allow awaiting the response - handled in onSocketMessage
  return new Promise((resolve, reject) => {
    // Reject if no response message arrives soon
    const timeoutHandle = setTimeout(() => {
      delete pending[id];
      reject(new Error('No response'));
    }, SEND_TIMEOUT_MS);

    /**
     * Callback when a message is received with this outgoing ID.
     *
     * @param {object} response - Response data from app who answered.
     */
    pending[id] = (response) => {
      clearTimeout(timeoutHandle);

      if (response.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response);
    };
  });
};

module.exports = {
  PORT,
  TOPIC_WHOAMI,
  TOPIC_HEARTBEAT,

  connect,
  disconnect,
  send,
  registerTopic,
  parseRoute,
  reply,
};
