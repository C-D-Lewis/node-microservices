const { execSync } = require('child_process');

/**
 * Get Pi CPU temperature (temp=36.5'C)
 *
 * @returns {number} Temperature in degrees C.
 */
const get = () => {
  const stdout = execSync('cat /sys/class/thermal/thermal_zone0/temp').toString();

  return Math.round(parseInt(stdout, 10) / 1000);
};

module.exports = {
  get,
};
