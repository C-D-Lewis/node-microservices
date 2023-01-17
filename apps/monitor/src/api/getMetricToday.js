const { getMetricHistoryToday } = require('../modules/metrics');

/**
 * Handle a 'getMetricToday' topic packet.
 *
 * @param {object} packet - The bifrost packet request.
 */
const handleGetMetricTodayPacket = async (packet) => {
  const { name } = packet.message;

  return { message: getMetricHistoryToday(name) };
};

module.exports = handleGetMetricTodayPacket;
