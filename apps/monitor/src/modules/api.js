const { bifrost } = require('../node-common')(['bifrost']);

/** Schema for messages getting metric data today */
const GET_METRIC_TODAY_MESSAGE_SCHEMA = {
  required: ['name'],
  properties: {
    name: { type: 'string' },
  },
};

/** Schema for messages updating metrics */
const UPDATE_METRICS_MESSAGE_SCHEMA = {
  required: ['metrics'],
  properties: {
    metrics: { type: 'object' },
  },
};

/** Schema for messages getting metric data today */
const NO_MESSAGE_SCHEMA = {};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await bifrost.connect();

  bifrost.registerTopic('getMetricToday', require('../api/getMetricToday'), GET_METRIC_TODAY_MESSAGE_SCHEMA);
  bifrost.registerTopic('updateMetrics', require('../api/updateMetrics'), UPDATE_METRICS_MESSAGE_SCHEMA);
  bifrost.registerTopic('getMetricNames', require('../api/getMetricNames'), NO_MESSAGE_SCHEMA);
  bifrost.registerTopic('getPlugins', require('../api/getPlugins'), NO_MESSAGE_SCHEMA);
};

module.exports = { setup };
