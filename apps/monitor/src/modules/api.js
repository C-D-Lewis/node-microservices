const { conduit } = require('../node-common')(['conduit']);

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
const GET_METRIC_NAMES_MESSAGE_SCHEMA = {};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('getMetricToday', require('../api/getMetricToday'), GET_METRIC_TODAY_MESSAGE_SCHEMA);
  conduit.on('updateMetrics', require('../api/updateMetrics'), UPDATE_METRICS_MESSAGE_SCHEMA);
  conduit.on('getMetricNames', require('../api/getMetricNames'), GET_METRIC_NAMES_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};