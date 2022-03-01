const { log, requestAsync, twilio } = require('../node-common')(['log', 'requestAsync', 'twilio']);

/** Alert at most once every 6 hours per currency */
const ALERT_INTERVAL_MS = 1000 * 60 * 60 * 6;

const lastAlert = {};

/**
 * Analyse changes and alert if needed.
 *
 * @param {object} currency - Nomics API response object for a given currency.
 * @returns {Promise}
 */
const analyseAndAlert = async (currency) => {
  const {
    id, name, '1d': lastDay, '7d': lastWeek,
  } = currency;
  const now = Date.now();

  // Down by 10% today
  const lastDayChange = parseFloat(lastDay.price_change_pct);
  if (lastDayChange < 0 && Math.abs(lastDayChange) > 0.1) {
    if (lastAlert[name] && (now - lastAlert[name]) < ALERT_INTERVAL_MS) return;

    await twilio.sendSmsNotification(`${name} (${id}) is DOWN ${lastDayChange} today!`);
    lastAlert[name] = now;
    return;
  }

  // Down by 10% this week
  let lastWeekChange = parseFloat(lastWeek.price_change_pct);
  if (lastWeekChange < 0 && Math.abs(lastWeekChange) > 0.1) {
    if (lastAlert[name] && (now - lastAlert[name]) < ALERT_INTERVAL_MS) return;

    await twilio.sendSmsNotification(`${name} (${id}) is DOWN ${lastWeekChange} this week!`);
    lastAlert[name] = now;
    return;
  }

  // Down by 20% this week
  lastWeekChange = parseFloat(lastWeek.price_change_pct);
  if (lastWeekChange < 0 && Math.abs(lastWeekChange) > 0.2) {
    if (lastAlert[name] && (now - lastAlert[name]) < ALERT_INTERVAL_MS) return;

    await twilio.sendSmsNotification(`${name} (${id}) is DOWN ${lastWeekChange} this week!`);
    lastAlert[name] = now;
    return;
  }

  log.info(`${name} (${id}) changed by ${lastDayChange} (${lastWeekChange} week)`);
};

/**
 * Send a Twilio alert given certain crypto price changes, such as '-0.1'% change.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const {
    CODES = ['BTC'],
    CONVERT_TO = 'GBP',
    NOMICS_KEY,
  } = args;
  const configured = CODES && CONVERT_TO && NOMICS_KEY;
  log.assert(configured, 'crypto-alerts.js requires some ARGS specified', true);

  const url = `https://api.nomics.com/v1/currencies/ticker?key=${NOMICS_KEY}&ids=${CODES.join(',')}&interval=1d,7d&convert=${CONVERT_TO}`;
  const { body } = await requestAsync({ url });
  const currencies = JSON.parse(body);

  await Promise.all(currencies.map(analyseAndAlert));
};
