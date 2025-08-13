/* eslint-disable no-param-reassign */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Metrics directory */
const METRICS_DIR = `${__dirname}/../../metrics`;

/**
 * Get today's date in YYYY-MM-DD format.
 *
 * @returns {string} - Today's date as a string.
 */
const getTodayDateString = () => new Date().toISOString().split('T')[0];

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
 * @param {string} [date] - Date to get file for, in YYYY-MM-DD format.
 * @returns {string} File path.
 */
const getFilePath = (date = getTodayDateString()) => {
  const selected = new Date(date);
  return `${METRICS_DIR}/metrics-${selected.getMonth() + 1}-${selected.getFullYear()}.json`;
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
 * @param {string} [date] - Date to load data for, in YYYY-MM-DD format.
 * @returns {object} Metric file data.
 */
const load = (date = getTodayDateString()) => {
  const filePath = getFilePath(date);
  console.log(`Loading metrics from ${filePath}`);

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
 * @param {string} date - Date to fetch data for, in YYYY-MM-DD format.
 * @returns {Array<MetricPoint>} Metric data so far today.
 */
const getMetricHistory = (name, date) => {
  const metricDb = load(date);

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
  getTodayDateString,
};
