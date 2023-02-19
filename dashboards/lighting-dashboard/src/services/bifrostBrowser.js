/* eslint-disable no-param-reassign */
const {
  SERVER,
} = window.Config;

const BifrostService = {};

/**
 * Get a query param.
 *
 * @param {string} k - Key to get.
 * @returns {string} Value if any.
 */
const getQueryParam = (k) => new URLSearchParams(window.location.search).get(k);

/**
 * Below adapted from node-common bifrost.js
 */

/** Fixed Norse port */
const PORT = 3918;
/** Access token for remote server */
const TOKEN = getQueryParam('token');
/** Client declaring itself */
const TOPIC_WHOAMI = 'whoami';
/** Topic for heartbeat */
const TOPIC_HEARTBEAT = 'heartbeat';
/** Heartbeat interval */
const HEARTBEAT_INTERVAL_MS = 30000;
/** Send tmeout */
const SEND_TIMEOUT_MS = 15000;

const pending = {};

let socket;
let connected;
let disconnectRequested;
let heartbeatHandle;

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
 * Validate a packet and make WebSocket payload.
 *
 * @param {string} prefix - Prefix for log.
 * @param {object} packet - Packet to prepare.
 * @returns {string} Validated packet as a WebSocket data string.
 */
const stringifyPacket = (prefix, packet) => {
  // TODO: Uses schema node-common module
  // validatePacket(packet);

  // Defaults here
  packet.message = packet.message || {};
  packet.from = packet.from || 'bifrostBrowser.js';

  if (packet.topic !== TOPIC_HEARTBEAT) {
    console.debug(`bifrost.js ${prefix} ${formatPacket(packet)}`);
  }
  return JSON.stringify(packet);
};

/**
 * Generate a message ID.
 *
 * @returns {string} Message ID.
 */
const generateId = () => `${Date.now() + Math.round(Math.random() * 10000)}`;

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
  }, HEARTBEAT_INTERVAL_MS);
  console.debug('bifrostBrowser.js: Began heartbeats');
};

/**
 * Tell the server which device and app we are.
 *
 * @returns {void}
 */
const sendWhoAmI = () => socket.send(stringifyPacket('>>', { to: 'bifrost', topic: TOPIC_WHOAMI }));

/**
 * When connection is open.
 *
 * @param {Function} resolve - Callback for the app.
 */
const onConnected = (resolve) => {
  console.debug('bifrostBrowser.js: onConnected()');
  disconnectRequested = false;
  connected = true;

  sendWhoAmI();
  startHeartbeats();
  resolve();
};

/**
 * When the socket receives a message. Different from node.js.
 *
 * @param {Event} event - Data event.
 * @returns {Promise<void>}
 */
const onSocketMessage = async (event) => {
  // Why is this not await event.data.text() anymore?
  const packet = JSON.parse(event.data);
  const {
    replyId, message = {},
  } = packet;
  console.debug(`bifrost.js << ${formatPacket(packet)}`);

  // Did we request this message response? Resolve the send()!
  // If we were't expecting this reply, ignore
  if (replyId) {
    if (pending[replyId]) {
      pending[replyId](message);
      delete pending[replyId];
    }
    return;
  }

  // We didn't ask for a packet response
  console.error(`Unexpected packet: ${JSON.stringify(packet)}`);
};

/**
 * Connect to the configured server.
 *
 * @param {object} [opts] - Function opts.
 * @param {string} [opts.server] - Override server.
 * @returns {Promise<void>}
 */
BifrostService.connect = async ({ server = SERVER } = {}) => new Promise((resolve) => {
  if (connected) {
    console.error('bifrostBrowser.js: Already connected to bifrost');
    return;
  }

  socket = new WebSocket(`ws://${server}:${PORT}`);

  /**
   * When the socket opens.
   */
  socket.onopen = () => {
    console.log(`Socket open: ${server}`);
    onConnected(resolve);
  };
  socket.onmessage = onSocketMessage;

  /**
   * When the socket closes.
   */
  socket.onclose = () => {
    connected = false;
    console.debug(`bifrostBrowser.js: closed (disconnectRequested: ${disconnectRequested})`);

    // Reconnect unless explicitly disconnected
    if (!disconnectRequested) {
      setTimeout(
        () => BifrostService.connect({ server }),
        5000,
      );
    }
  };

  /**
   * When the socket has an error.
   *
   * @param {Error} err - Error event.
   */
  socket.onerror = (err) => {
    console.error(err);
    console.error('bifrostBrowser.js: errored - closing');
    socket.close();
  };
});

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
 * @param {string} [opts.token] - Guestlist token if required.
 * @returns {Promise<object>} Response message data.
 */
BifrostService.send = ({
  to, from, topic, message = {}, token = TOKEN || undefined,
}) => {
  if (!connected) throw new Error('bifrostBrowser.js: not yet connected');

  // Send this message to the chosen app
  const id = generateId();
  const packet = {
    id,
    to,
    from,
    topic,
    message,
    token,
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

/**
 * Send a message to another device, no reply possible.
 *
 * @param {string} server - Temporary server to connect to.
 * @param {object} packet - Packet to send.
 * @returns {Promise<void>}
 */
BifrostService.sendAndClose = (server, packet) => new Promise((resolve, reject) => {
  // Use a temporary connection, all in this function.
  const tempSocket = new WebSocket(`ws://${server}:${PORT}`);
  tempSocket.on('open', () => {
    console.log(`temp: open: ${server}`);

    // Send data, then resolve without reply
    const payload = { id: generateId(), ...packet };
    tempSocket.send(stringifyPacket('temp>>', payload));
    tempSocket.close();
    resolve();
  });
  tempSocket.on('close', () => console.log('temp: closed'));
  tempSocket.on('error', (err) => {
    console.error(err);
    console.error('temp: errored - closing');
    tempSocket.close();
    reject();
  });
});
