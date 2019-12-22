const { conduit } = require('../node-common')(['conduit']);
const { get, set } = require('../modules/storage');

const { respond } = conduit;

/**
 * Handle a 'get' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleIncrementRequest = async (packet, res) => {
  const { app, key } = packet.message;
  const appData = await get(app);
  if (!appData || !appData[key]) {
    respond(res, { status: 404, error: `app ${app} or key ${key} not found` });
    return;
  }

  const { value } = appData[key];
  if (typeof value !== 'number') {
    respond(res, { status: 400, error: `value ${value} is not a number, cannot increment` });
    return;
  }

  appData[key] = { timestamp: Date.now(), value: value + 1 };
  await set(app, appData);
  respond(res, { status: 200, message: { content: 'OK' } });
};

module.exports = handleIncrementRequest;
