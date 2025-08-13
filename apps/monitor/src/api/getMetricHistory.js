const { getMetricHistory, getTodayDateString } = require('../modules/metrics');
const { conduit } = require('../node-common')(['conduit']);

/**
 * Handle a 'getMetricHistory' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetMetricHistoryPacket = async (packet, res) => {
  const today = getTodayDateString();
  const { name, date = today } = packet.message;
  const data = getMetricHistory(name, date);

  conduit.respond(res, { status: 200, message: data });
};

module.exports = handleGetMetricHistoryPacket;
