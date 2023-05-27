const { execSync } = require('child_process');
const log = require('./log');

/**
 * Get Pi CPU temperature (temp=36.5'C)
 *
 * @returns {number} Temperature in degrees C.
 */
const get = () => {
  try {
    const stdout = execSync('cat /sys/class/thermal/thermal_zone0/temp').toString();

    return Math.round(parseInt(stdout, 10) / 1000);
  } catch (e) {
    log.error(e.message);
    return 0;
  }
};

module.exports = { get };
