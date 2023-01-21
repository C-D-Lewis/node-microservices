/* eslint-disable no-param-reassign */

const { WebSocket } = require('ws');
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

/** Fixed Norse port */
const PORT = 3918;
/** Client declaring itself */
const TOPIC_WHOAMI = 'whoami';
/** Topic for heartbeat */
const TOPIC_HEARTBEAT = 'heartbeat';
/** Known apps */
const TOPIC_KNOWN_APPS = 'knownApps';
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;
/** Send tmeout */
const SEND_TIMEOUT_MS = 15000;
/** Schema for all conduit message packets. */
const PACKET_SCHEMA = {
  required: ['to', 'topic'],
  additionalProperties: false,
  properties: {
    id: { type: 'string' },
    replyId: { type: 'string' },
    to: { type: 'string' },
    from: { type: 'string' },
    topic: { type: 'string' },
    message: { type: 'object' },
    error: { type: 'string' },
  },
};

const topics = {};
const pending = {};

let socket;
let connected;
let disconnectRequested = false;
let heartbeatHandle;
let thisAppName = APP_NAME; // Could be overridden

/**
 * Format a packet in a readable format.
 *
 * @param {object} packet - Packet to log.
 * @returns {string} Formatted packet.
 */
const formatPacket = (packet) => {
  const {
    from, to, topic, message, id, replyId,
  } = packet;
  return `${from}>${to}:${topic} ${JSON.stringify(message)} (${id || ''}/${replyId || ''})`;
};

/**
 * Validate a packet, either sent or received.
 *
 * @param {object} packet - Packet to validate.
 * @throws {Error}s
 */
const validatePacket = (packet) => {
  if (!schema(packet, PACKET_SCHEMA)) throw new Error(`Invalid packet: ${JSON.stringify(packet)}`);
};

/**
 * Validate a packet and make WebSocket payload.
 *
 * @param {string} prefix - Prefix for log.
 * @param {object} packet - Packet to prepare.
 * @returns {string} Validated packet as a WebSocket data string.
 */
const stringifyPacket = (prefix, packet) => {
  validatePacket(packet);

  // Defaults here
  packet.message = packet.message || {};
  packet.from = packet.from || thisAppName;

  log.debug(`${prefix} ${formatPacket(packet)}`);
  return JSON.stringify(packet);
};

/**
 * Stop heartbeats.
 *
 * @returns {void}
 */
const stopHearbeats = () => clearInterval(heartbeatHandle);

/**
 * Start heartbeat loop to keepalive connection.
 */
const startHeartbeats = () => {
  stopHearbeats();

  heartbeatHandle = setInterval(() => {
    socket.send(stringifyPacket('>>', { to: 'bifrost', topic: TOPIC_HEARTBEAT }));
    // log.debug('bifrost.js: Sent heartbeat');
  }, HEARTBEAT_INTERVAL_MS);
  log.debug('bifrost.js: Began heartbeats');
};

/**
 * Tell the server which device and app we are.
 */
const sendWhoAmI = () => {
  socket.send(stringifyPacket('>>', { to: 'bifrost', topic: TOPIC_WHOAMI }));
  // log.debug('bifrost.js: Sent whoami');
};

/**
 * Expect messages on a given topic.
 *
 * @param {string} topic - Topic to listen to.
 * @param {Function} cb - Callback returning app data.
 * @param {object} topicSchema - Schema for topic messages.
 */
const registerTopic = (topic, cb, topicSchema) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');
  if (!topicSchema) throw new Error('Topics require schema');

  topics[topic] = { cb, topicSchema };
  log.debug(`bifrost.js: Added topic '${topic}'`);
};

/**
 * Send a reply to a received packet with an 'id'.
 *
 * @param {object} packet - Packet received.
 * @param {object} message - Response data.
 */
const reply = async (packet, message) => {
  const { id, from, topic } = packet;
  if (!id) {
    log.error('Cannot reply to packet with no \'id\'');
    log.error(JSON.stringify(packet));
    return;
  }

  // Reply to sender app
  const payload = {
    replyId: id,
    to: from,
    topic,
    message,
  };
  socket.send(stringifyPacket('<>', payload));
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
    replyId, topic, message = {},
  } = packet;
  log.debug(`<< ${formatPacket(packet)}`);

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
  const response = (await cb(packet)) || { ok: true };
  reply(packet, response);
};

/**
 * Connect to the configured server.
 *
 * @param {object} [opts] - Function opts.
 * @param {string} [opts.appName] - Override this app name.
 * @param {string} [opts.server] - Override server.
 * @returns {Promise<void>}
 */
const connect = async ({ appName, server = SERVER } = {}) => new Promise((resolve) => {
  if (connected) {
    log.error('bifrost.js: Warning: Already connected to bifrost');
    return;
  }

  if (appName) {
    thisAppName = appName;
    log.debug(`bifrost.js: Overridden app name: ${thisAppName}`);
  }

  socket = new WebSocket(`ws://${server}:${PORT}`);
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
 * @param {string} opts.to - App to send to.
 * @param {string} [opts.from] - Override from.
 * @param {string} opts.topic - Topic to broadcast on.
 * @param {object} [opts.message] - Data to send.
 * @returns {Promise<object>} Response message data.
 */
const send = ({
  to, from, topic, message = {},
}) => {
  if (!connected) throw new Error('bifrost.js: not yet connected');

  // Send this message to the chosen app
  const id = `${Date.now() + Math.round(Math.random() * 10000)}`;
  const packet = {
    id,
    to,
    from,
    topic,
    message,
  };
  socket.send(stringifyPacket('>>', packet));

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
        delete pending[id];
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
  TOPIC_KNOWN_APPS,

  connect,
  disconnect,
  send,
  reply,
  registerTopic,
  validatePacket,
  formatPacket,
};
