const { readFileSync, writeFileSync, existsSync } = require('fs');
const { log, enviro, ses } = require('../node-common')(['log', 'enviro', 'ses']);

/** Destination file name */
const CSV_FILE_NAME = `${__dirname}/../../enviro.csv`;

let notified = false;

/**
 * Log environment sensor data to a file.
 */
module.exports = async () => {
  try {
    const sample = enviro.readAll();
    const timestamp = Date.now();
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
      ? 'timestamp,rawTemp,adjTemp,pressure,humidity,lux,proximity'
      : readFileSync(CSV_FILE_NAME, 'utf8');
    data = data.concat(`\n${timestamp},${rawTemp},${adjTemp},${pressure},${humidity},${lux},${proximity}`);
    writeFileSync(CSV_FILE_NAME, data, 'utf8');

    log.info(`Logged '${JSON.stringify(sample)}' from enviro`);

    // Notify the heating is on (temporary)
    const adjTempInt = parseInt(adjTemp, 10);
    const heating = adjTempInt > 20;
    if (heating && !notified) {
      await ses.notify(`Heating turned on (${adjTempInt})`);
      notified = true;
    }

    // Reset if recovers
    if (!heating && notified) {
      await ses.notify(`Heating turned off (${adjTempInt})`);
      notified = false;
    }
  } catch (e) {
    log.error(e);
  }
};
