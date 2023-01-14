const { conduit } = require('../node-common')(['conduit']);
const devices = require('../modules/devices');

/**
 * Handle a 'rediscover' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleRediscover = (packet, res) => {
  devices.rediscover();

  conduit.respond(res, { status: 202, message: { content: 'Rediscovery started' } });
};

module.exports = handleRediscover;
