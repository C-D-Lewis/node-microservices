const { get, set } = require('../modules/storage');

/**
 * Handle a 'get' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 * @returns {object} Response data.
 */
const handleIncrementPacket = async (packet) => {
  const { app, key } = packet.message;
  let appData = await get(app);
  if (!appData || !appData[key]) {
    // Initialise to 0
    if (!appData) {
      appData = {};
    }
    appData[key] = { timestamp: Date.now(), value: 0 };
    await set(app, appData);
    return { content: 'OK' };
  }

  const { value } = appData[key];
  if (typeof value !== 'number') return { error: `value ${value} is not a number, cannot increment` };

  appData[key] = { timestamp: Date.now(), value: value + 1 };
  await set(app, appData);
  return { content: 'OK' };
};

module.exports = handleIncrementPacket;
