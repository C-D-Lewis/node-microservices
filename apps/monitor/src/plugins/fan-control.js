const { log, gpio, temperature } = require('../node-common')(['log', 'gpio','temperature']);

/** Fan GPIO pin */
const GPIO_PIN = 23;
/** High temperature threshold */
const THRESHOLD = 50;

module.exports = async (args) => {
  try {
    const reading = temperature.get();
    const state = reading > THRESHOLD;
    const success = gpio.set(GPIO_PIN, state);
    if (!success) {
      throw new Error('Fan set failed');
    }

    log.info(`Set fan ${state}, temperature is ${reading}`);
  } catch (e) {
    log.error(e);
  }
};
