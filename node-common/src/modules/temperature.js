const { execSync } = require('child_process');

/**
 * Get Pi CPU temperature (temp=36.5'C)
 *
 * @returns {number} Temperature in degrees C.
 */
const get = () => {
  const stdout = execSync('/opt/vc/bin/vcgencmd measure_temp').toString();
  if (!stdout.includes('temp=')) {
    throw new Error(`Temperature unavailable: ${stdout}`);
  }

  return parseFloat(stdout.split('=')[1].split('\'')[0]);
};

module.exports = {
  get,
};
