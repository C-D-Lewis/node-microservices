const { log, conduit } = require('../node-common')(['log', 'conduit']);
const devices = require('../modules/devices');

/**
 * Handle a 'rediscover' topic packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleRediscover = (packet, res) => {
  devices.rediscover();

  conduit.respond(res, { status: 202, message: { content: 'Rediscovery started' } });
};

module.exports = handleRediscover;
