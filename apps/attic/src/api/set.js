const { conduit } = require('../node-common')(['conduit']);
const { get, set } = require('../modules/storage');

/**
 * Handle a 'set' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleSetPacket = async (packet, res) => {
  const { app, key, value } = packet.message;
  const appData = (await get(app)) || {};

  appData[key] = { value, timestamp: Date.now() };
  await set(app, appData);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleSetPacket;
