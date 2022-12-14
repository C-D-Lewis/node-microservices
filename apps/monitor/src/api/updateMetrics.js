const { updateMetrics } = require('../modules/metrics');
const { conduit } = require('../node-common')(['conduit']);

/**
 * Handle a 'updateMetrics' topic packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleUpdateMetricsPacket = async (packet, res) => {
  const { metrics } = packet.message;
  updateMetrics(metrics);

  conduit.respond(res, { status: 200, message: { content: 'success' } });
};

module.exports = handleUpdateMetricsPacket;
