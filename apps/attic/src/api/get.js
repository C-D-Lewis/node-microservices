const { get } = require('../modules/storage');

/**
 * Handle a 'get' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleGetPacket = async (packet) => {
  const { app, key } = packet.message;
  const appData = await get(app);
  if (!appData || !appData[key]) return { error: `app ${app} or key ${key} not found` };

  const { value, timestamp } = appData[key];
  return {
    app, key, value, timestamp,
  };
};

module.exports = handleGetPacket;
