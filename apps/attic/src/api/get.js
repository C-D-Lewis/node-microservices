const { conduit } = require('../node-common')(['conduit']);
const { get } = require('../modules/storage');

/**
 * Handle a 'get' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleGetRequest = async (packet, res) => {
  const { app, key } = packet.message;
  const appData = await get(app);
  if (!appData || !appData[key]) {
    conduit.respond(res, { status: 404, error: `app ${app} or key ${key} not found` });
    return;
  }

  const { value, timestamp } = appData[key];
  conduit.respond(res, { status: 200, message: { app, key, value, timestamp } });
};

module.exports = handleGetRequest;
