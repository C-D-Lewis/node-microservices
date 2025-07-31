const { getMetricHistory } = require('../modules/metrics');
const { conduit } = require('../node-common')(['conduit']);

/**
 * Get today's date in YYYY-MM-DD format.
 *
 * @returns {string} - Today's date as a string.
 */
const today = () => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Handle a 'getMetricHistory' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleGetMetricHistoryPacket = async (packet, res) => {
  const { name, date = today() } = packet.message;
  const data = getMetricHistory(name, date);

  conduit.respond(res, { status: 200, message: data });
};

module.exports = handleGetMetricHistoryPacket;
