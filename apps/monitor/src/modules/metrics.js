/* eslint-disable no-param-reassign */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { execSync } = require('child_process');
const { log } = require('../node-common')(['log']);

/** Metrics directory */
const METRICS_DIR = `${__dirname}/../../metrics`;

/** Gamble on not being up for too many months */
const metricMonths = {};

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
 * Save the metrics file. Always not.
 */
const save = () => {
  const now = new Date();
  const month = now.getMonth() + 1;

  // Check current month file exists for first time launch
  if (!metricMonths[month]) {
    metricMonths[month] = {};
  }

  const filePath = getFilePath(now.toISOString());
  execSync(`mkdir -p ${METRICS_DIR}`);
  writeFileSync(filePath, JSON.stringify(metricMonths[month]), 'utf-8');
};

/**
 * Load the metrics file.
 *
 * @param {string} [date] - Date to load data for, in YYYY-MM-DD format.
 * @returns {object} Metric file data.
 */
const load = (date = getTodayDateString()) => {
  const selected = new Date(date);
  const month = selected.getMonth() + 1;

  // Already loaded this month
  if (metricMonths[month]) return metricMonths[month];

  const filePath = getFilePath(date);
  if (!existsSync(filePath)) save();

  log.debug(`Loading metrics from ${filePath}`);
  metricMonths[month] = JSON.parse(readFileSync(filePath, 'utf-8'));
  return metricMonths[month];
};

/**
 * Update a metric's value.
 *
 * @param {object} db - All metric data.
 * @param {string} name - Metric name.
 * @param {*} value - New metric value.
 */
const updateMetric = (db, name, value) => {
  // First point for this metric
  if (!db[name]) {
    db[name] = [];
  }

  // Add new data point, minimal size
  const now = new Date();
  const point = [now.getTime(), value];
  log.debug(`metric ${name}=${value}`);
  db[name].push(point);
};

/**
 * Update multiple metrics at once.
 *
 * @param {object} metrics - Key-value object of new metric data.
 */
const updateMetrics = (metrics) => {
  const db = load();
  Object.entries(metrics).forEach(([k, v]) => updateMetric(db, k, v));
  save();
};

/**
 * Get metric history so far today.
 *
 * @param {string} name - Metric to fetch.
 * @param {string} date - Date to fetch data for, in YYYY-MM-DD format.
 * @returns {Array<MetricPoint>} Metric data so far today.
 */
const getMetricHistory = (name, date) => {
  const db = load(date);

  // Does not exist
  if (!db[name]) {
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
  return db[name]
    .filter(([timestamp]) => timestamp > dayStart.getTime() && timestamp < dayEnd.getTime());
};

/**
 * Get all known metric names.
 * Dashboard assumes this set never changes month-to-month...
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
