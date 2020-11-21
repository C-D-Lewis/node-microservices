const { readFileSync, writeFileSync, existsSync } = require('fs');
const { log, enviro } = require('../node-common')(['log', 'enviro']);

/** Destination file name */
const CSV_FILE_NAME = `${__dirname}/../../enviro.csv`;

/**
 * Log environment sensor data to a file.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async () => {
  try {
    const sample = enviro.readAll();
    const timestamp = Date.now();
    const {
      temperature,
      pressure,
      humidity,
      lux,
      proximity,
    } = sample;

    // Append to CSV
    let data = (!existsSync(CSV_FILE_NAME))
      ? 'timestamp,temperature,pressure,humidity,lux,proximity'
      : readFileSync(CSV_FILE_NAME, 'utf8');
    data = data.concat(`\n${timestamp},${temperature},${pressure},${humidity},${lux},${proximity}`);
    writeFileSync(CSV_FILE_NAME, data, 'utf8');

    log.info(`Logged '${JSON.stringify(sample)}' from enviro`);
  } catch (e) {
    log.error(e);
  }
};
