const config = require('./config');
const fetch = require('./fetch');

config.addPartialSchema({
  required: ['CONDUIT'],
  properties: {
    CONDUIT: {
      properties: {
        TOKEN: { type: 'string' },
      },
    },
  },
});

const { CONDUIT } = config.get(['CONDUIT']);

/** Conduit port */
const CONDUIT_PORT = 5959;

let host = 'localhost';
let appName;

/**
 * Send a conduit packet.
 *
 * @param {object} packet - Packet to send.
 * @returns {object} Response body.
 */
const conduitSend = async (packet) => {
  // eslint-disable-next-line no-param-reassign
  packet.auth = CONDUIT.TOKEN || '';

  const { data } = await fetch({
    url: `http://${host}:${CONDUIT_PORT}/conduit`,
    method: 'post',
    body: JSON.stringify(packet),
  });
  return data;
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
const set = async (key, value) => conduitSend({
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
  if (!appName) throw new Error('attic.js: setAppName was not used');

  const res = await conduitSend({
    to: 'attic',
    topic: 'get',
    message: {
      app: appName,
      key,
    },
  });

  // Not connected, not found etc.
  if (res.error) throw new Error(res.error);

  return res.message.value;
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
    console.log(`Error checking key ${key} exists in app ${appName}`);
    console.log(e);
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
