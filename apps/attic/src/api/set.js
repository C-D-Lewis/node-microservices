const { get, set } = require('../modules/storage');

/**
 * Handle a 'set' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleSetPacket = async (packet) => {
  const { app, key, value } = packet.message;
  const appData = (await get(app)) || {};

  appData[key] = { value, timestamp: Date.now() };
  await set(app, appData);
  return { content: 'OK' };
};

module.exports = handleSetPacket;
