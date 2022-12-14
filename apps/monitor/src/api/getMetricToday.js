const { getMetricHistoryToday } = require('../modules/metrics');
const { conduit } = require('../node-common')(['conduit']);

/**
 * Handle a 'getMetricToday' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetMetricTodayPacket = async (packet, res) => {
  const { name } = packet.message;
  const data = getMetricHistoryToday(name);

  conduit.respond(res, { status: 200, message: data });
};

module.exports = handleGetMetricTodayPacket;
