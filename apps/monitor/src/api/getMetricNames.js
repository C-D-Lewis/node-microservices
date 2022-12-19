const { getMetricNames } = require('../modules/metrics');
const { conduit } = require('../node-common')(['conduit']);

/**
 * Handle a 'getMetricToday' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetMetricTodayPacket = async (packet, res) => conduit.respond(
  res,
  { status: 200, message: getMetricNames() },
);

module.exports = handleGetMetricTodayPacket;
