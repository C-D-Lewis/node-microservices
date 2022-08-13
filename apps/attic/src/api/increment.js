const { conduit } = require('../node-common')(['conduit']);
const { get, set } = require('../modules/storage');

/**
 * Handle a 'get' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleIncrementPacket = async (packet, res) => {
  const { app, key } = packet.message;
  let appData = await get(app);
  if (!appData || !appData[key]) {
    // Initialise to 0
    if (!appData) {
      appData = {};
    }
    appData[key] = { timestamp: Date.now(), value: 0 };
    await set(app, appData);
    conduit.respond(res, { status: 200, message: { content: 'OK' } });
    return;
  }

  const { value } = appData[key];
  if (typeof value !== 'number') {
    conduit.respond(res, { status: 400, error: `value ${value} is not a number, cannot increment` });
    return;
  }

  appData[key] = { timestamp: Date.now(), value: value + 1 };
  await set(app, appData);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleIncrementPacket;
