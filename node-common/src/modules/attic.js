const config = require('./config');
const bifrost = require('./bifrost');

const { BIFROST, LOG } = config.withSchema('attic.js', {
  required: ['BIFROST'],
  properties: {
    BIFROST: {
      properties: {
        TOKEN: { type: 'string' },
      },
    },
  },
});

// TODO: How to send to another host? Multiple connections?
let host = 'localhost';
let appName = LOG.APP_NAME || 'Unknown';

/**
 * Send a bifrost packet.
 *
 * @param {object} packet - Packet to send.
 * @returns {object} Response body.
 */
const sendPacket = async (packet) => {
  // eslint-disable-next-line no-param-reassign
  packet.auth = BIFROST.TOKEN || '';

  return bifrost.send(packet);
};

/**
 * Change the local host name.
 *
 * @param {string} newHost - New host name.
 */
const setHost = (newHost) => {
  host = newHost;
};

/**
 * Set the local app name.
 *
 * @param {string} newAppName - New app name.
 */
const setAppName = (newAppName) => {
  appName = newAppName;
};

/**
 * Set a value in the local attic app DB.
 *
 * @param {string} key - Data key.
 * @param {*} value - Data value.
 * @returns {Promise<object>} Response body.
 */
const set = async (key, value) => sendPacket({
  to: 'attic',
  topic: 'set',
  message: {
    key,
    value,
    app: appName,
  },
});

/**
 * Get a value from the local attic app DB.
 *
 * @param {string} key - Data key.
 * @returns {Promise<*>} Data value.
 * @throws {Error} If key not found or some other error occurred.
 */
const get = async (key) => {
  const message = await sendPacket({
    to: 'attic',
    topic: 'get',
    message: {
      app: appName,
      key,
    },
  });

  // Not connected, not found etc.
  if (message.error) throw new Error(message.error);

  return message.value;
};

/**
 * Test a data item exists the local attic app DB.
 *
 * @param {string} key - Data key.
 * @returns {boolean} true if the data was found.
 */
const exists = async (key) => {
  try {
    await get(key);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  set,
  get,
  exists,
  setHost,
  setAppName,
};
