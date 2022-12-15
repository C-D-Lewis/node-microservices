const { readFileSync, writeFileSync, existsSync } = require('fs');
const { log, enviro, ses } = require('../node-common')(['log', 'enviro', 'ses']);
const { updateMetrics } = require('../modules/metrics');

/** Destination file name */
const CSV_FILE_NAME = `${__dirname}/../../enviro.csv`;

let notified = false;
let lastTenMinTemp = 0;

/**
 * Check and notify when heating comes on.
 *
 * @param {Date} now - Date now.
 * @param {number} adjTemp - Adjusted temperature value.
 * @returns {Promise<void>}
 */
const checkHeatingState = async (now, adjTemp) => {
  const isHeating = adjTemp - lastTenMinTemp > 3;
  const isCooling = adjTemp - lastTenMinTemp < -2;

  if (now.getMinutes() % 10 === 0 || lastTenMinTemp === 0) {
    // Remember this value for next 10 minutes
    lastTenMinTemp = adjTemp;
    log.debug(`lastTenMinTemp=${lastTenMinTemp}`);
    return;
  }

  // Greatly increased
  if (isHeating && !notified) {
    await ses.notify(`Heating turned on (${adjTemp})`);
    notified = true;
    return;
  }

  // Greatly decreased
  if (isCooling && notified) {
    await ses.notify(`Heating turned off (${adjTemp})`);
    notified = false;
  }
};

/**
 * Log environment sensor data to a file.
 */
module.exports = async () => {
  try {
    const sample = enviro.readAll();
    const now = new Date();
    const timestamp = now.getTime();
    const [dateTime] = now.toISOString().split('.');
    const {
      rawTemp,
      adjTemp,
      pressure,
      humidity,
      lux,
      proximity,
    } = sample;

    // Append to CSV or start with just headers
    let data = (!existsSync(CSV_FILE_NAME))
      ? 'timestamp,dateTime,rawTemp,adjTemp,pressure,humidity,lux,proximity'
      : readFileSync(CSV_FILE_NAME, 'utf8');
    data = data.concat(`\n${timestamp},${dateTime},${rawTemp},${adjTemp},${pressure},${humidity},${lux},${proximity}`);
    writeFileSync(CSV_FILE_NAME, data, 'utf8');
    log.info(`Logged '${JSON.stringify(sample)}' from enviro`);

    // Update metrics
    updateMetrics({ rawTemp, adjTemp });

    // Temporary
    await checkHeatingState(now, adjTemp);
  } catch (e) {
    log.error(e);
  }
};
