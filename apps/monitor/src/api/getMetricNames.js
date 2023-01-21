const { getMetricNames } = require('../modules/metrics');

/**
 * Handle a 'getMetricToday' topic packet.
 *
 * @returns {object} Response data.
 */
const handleGetMetricTodayPacket = async () => ({ names: getMetricNames() });

module.exports = handleGetMetricTodayPacket;
