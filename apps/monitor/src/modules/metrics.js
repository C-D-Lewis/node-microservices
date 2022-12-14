/* eslint-disable no-param-reassign */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { log } = require('../node-common')(['log']);

/**
 * @typedef {object} MetricPoint
 * @property {number} timestamp - Timestamp.
 * @property {string} dateTime - Simplified datetime.
 * @property {*} value - Metric value.
 */

// TODO: File per day?
/** Metrics file name */
const FILE_NAME = `${__dirname}/../../metrics.json`;

/**
 * Save the metrics file.
 *
 * @param {object} metricDb - Data to save.
 * @returns {void}
 */
const save = (metricDb) => writeFileSync(FILE_NAME, JSON.stringify(metricDb), 'utf-8');

/**
 * Load the metrics file.
 *
 * @returns {object} Metric file data.
 */
const load = () => {
  // No existing metrics data
  if (!existsSync(FILE_NAME)) save({});

  return JSON.parse(readFileSync(FILE_NAME, 'utf-8'));
};

/**
 * Update a metric's value.
 *
 * @param {object} metricDb - All metric data.
 * @param {string} name - Metric name.
 * @param {*} value - New metric value.
 */
const updateMetric = (metricDb, name, value) => {
  // First point for this metric
  if (!metricDb[name]) {
    metricDb[name] = [];
  }

  // Add new data point
  const now = new Date();
  const [dateTime] = now.toISOString().split('.');
  const point = {
    timestamp: now.getTime(),
    dateTime,
    value,
  };
  log.debug(`metric ${name}=${value}`);
  metricDb[name].push(point);
};

/**
 * Update multiple metrics at once.
 *
 * @param {object} metrics - Key-value object of new metric data.
 */
const updateMetrics = (metrics) => {
  const metricDb = load();
  Object.entries(metrics).forEach(([k, v]) => updateMetric(metricDb, k, v));
  save(metricDb);
};

/**
 * Get metric history so far today.
 *
 * @param {string} name - Metric to fetch.
 * @returns {Array<MetricPoint>} Metric data so far today.
 */
const getMetricHistoryToday = (name) => {
  const metricDb = load();

  // Does not exist
  if (!metricDb[name]) {
    log.debug(`No metric data for ${name}`);
    return [];
  }

  // Only from start of today
  const todayStart = new Date();
  todayStart.setHours(0);
  todayStart.setMinutes(0);
  todayStart.setSeconds(0);
  todayStart.setMilliseconds(0);
  return metricDb[name].filter((p) => p.timestamp > todayStart.getTime());
};

module.exports = {
  updateMetrics,
  getMetricHistoryToday,
};
