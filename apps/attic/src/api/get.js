const { conduit } = require('../node-common')(['conduit']);
const { get } = require('../modules/storage');

/**
 * Handle a 'get' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetPacket = async (packet, res) => {
  const { app, key } = packet.message;
  const appData = await get(app);
  if (!appData || !appData[key]) {
    conduit.respond(res, { status: 404, error: `app ${app} or key ${key} not found` });
    return;
  }

  const { value, timestamp } = appData[key];
  conduit.respond(res, {
    status: 200,
    message: {
      app, key, value, timestamp,
    },
  });
};

module.exports = handleGetPacket;
