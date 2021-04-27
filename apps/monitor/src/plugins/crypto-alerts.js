const { log, requestAsync, twilio } = require('../node-common')(['log', 'requestAsync', 'twilio']);

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

  // Down by 10% today
  const lastDayChange = parseFloat(lastDay.price_change_pct);
  if (lastDayChange < 0 && Math.abs(lastDayChange) > 0.1) {
    await twilio.sendSmsNotification(`${name} (${id}) is DOWN 10% today!`);
    return;
  }

  // Down by 20% this week
  const lastWeekChange = parseFloat(lastWeek.price_change_pct);
  if (lastWeekChange < 0 && Math.abs(lastWeekChange) > 0.2) {
    await twilio.sendSmsNotification(`${name} (${id}) is DOWN 20% this week!`);
    return;
  }

  log.info(`${name} (${id}) changed by ${lastDayChange} (${lastWeekChange} week)`);
};

/**
 * Send a Twilio alert given certain crypto price changes, such as '-0.1'% change.
 *
 * @param {Object} args - plugin ARGS object.
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
