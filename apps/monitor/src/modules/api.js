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
/** Email notification message schema */
const NOTIFY_MESSAGE_SCHEMA = {
  required: ['content'],
  properties: {
    content: { type: 'string' },
  },
};

/** Schema for messages with no inputs */
const NULL_SCHEMA = {};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await conduit.register({ appName: 'monitor' });

  conduit.on('getMetricToday', require('../api/getMetricToday'), GET_METRIC_TODAY_MESSAGE_SCHEMA);
  conduit.on('updateMetrics', require('../api/updateMetrics'), UPDATE_METRICS_MESSAGE_SCHEMA);
  conduit.on('getMetricNames', require('../api/getMetricNames'), NULL_SCHEMA);
  conduit.on('getPlugins', require('../api/getPlugins'), NULL_SCHEMA);
  conduit.on('notify', require('../api/notify'), NOTIFY_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
