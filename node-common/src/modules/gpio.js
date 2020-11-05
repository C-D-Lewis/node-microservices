const { execSync } = require('child_process');
const os = require('os');

/**
 * Can LED hardware be used?
 *
 * @returns {boolean}
 */
const hardwareAvailable = () => {
  if (!os.arch().includes('arm') || !config.LEDS.USE_HARDWARE) return false;
  if (!initialised) init();

  return true;
};

/**
 * Set a GPIO pin.
 *
 * @param {number} pin - GPIO pin number (https://www.raspberrypi.org/documentation/usage/gpio/)
 * @param {boolean} state - true for on, false for off.
 * @returns {boolean} true if the operation probably succeeded.
 */
const set = (pin, state) => {
  if (!hardwareAvailable()) {
    console.log('Not running on ARM');
    return;
  }

  try {
    const pinState = state ? 1 : 0;
    const stdout = execSync(`python3 ${__dirname}/../lib/set-gpio.py ${pin} ${pinState}`);
    if (!stdout.includes(`set ${pin} to ${pinState}`)) {
      throw new Error(`Unexpected output from set-gpio.py: ${stdout}`);
    }
  } catch (err) {
    console.log(err);
    throw new Error('GPIO unexpectedly unavailable');
  }
};

module.exports = {
  set,
  // get, one day
};
