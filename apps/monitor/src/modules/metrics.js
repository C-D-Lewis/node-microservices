/* eslint-disable no-param-reassign */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Metrics directory */
const METRICS_DIR = `${__dirname}/../../metrics`;

/**
 * @typedef {object} MetricPoint
 * @property {number} timestamp - Timestamp.
 * @property {string} dateTime - Simplified datetime.
 * @property {*} value - Metric value.
 */

// Note: Can't use CSV unless easy to add new column headers. Won't get too large anyway.

/**
 * Get metric file path - file per month.
 *
 * @returns {string} File path.
 */
const getFilePath = () => {
  const now = new Date();
  return `${METRICS_DIR}/metrics-${now.getMonth() + 1}-${now.getFullYear()}.json`;
};

/**
 * Save the metrics file.
 *
 * @param {object} metricDb - Data to save.
 */
const save = (metricDb) => {
  execSync(`mkdir -p ${METRICS_DIR}`);
  writeFileSync(getFilePath(), JSON.stringify(metricDb, null, 2), 'utf-8');
};

/**
 * Load the metrics file.
 *
 * @returns {object} Metric file data.
 */
const load = () => {
  const filePath = getFilePath();

  // No existing metrics data
  if (!existsSync(filePath)) save({});

  return JSON.parse(readFileSync(filePath, 'utf-8'));
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

  // Add new data point, minimal size
  const now = new Date();
  const point = [now.getTime(), value];
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
 * @param {string} [date] - Date to fetch data for, in YYYY-MM-DD format.
 * @returns {Array<MetricPoint>} Metric data so far today.
 */
const getMetricHistory = (name, date) => {
  const metricDb = load();

  // Does not exist
  if (!metricDb[name]) {
    log.debug(`No metric data for ${name}`);
    return [];
  }

  // Only from specified day
  const dayStart = new Date(date);
  dayStart.setHours(0);
  dayStart.setMinutes(0);
  dayStart.setSeconds(0);
  dayStart.setMilliseconds(0);
  const dayEnd = new Date(date);
  dayEnd.setHours(23);
  dayEnd.setMinutes(59);
  dayEnd.setSeconds(59);
  dayEnd.setMilliseconds(999);
  return metricDb[name]
    .filter(([timestamp]) => timestamp > dayStart.getTime() && timestamp < dayEnd.getTime());
};

/**
 * Get all known metric names.
 *
 * @returns {Array<string>} Metric names.
 */
const getMetricNames = () => Object.keys(load());

module.exports = {
  updateMetrics,
  getMetricHistory,
  getMetricNames,
};
