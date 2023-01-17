const { updateMetrics } = require('../modules/metrics');

/**
 * Handle a 'updateMetrics' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 */
const handleUpdateMetricsPacket = async (packet) => {
  const { metrics } = packet.message;
  updateMetrics(metrics);

  return { message: { content: 'success' } };
};

module.exports = handleUpdateMetricsPacket;
