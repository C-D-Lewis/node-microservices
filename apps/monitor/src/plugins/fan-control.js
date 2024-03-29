const { log, gpio, temperature } = require('../node-common')(['log', 'gpio', 'temperature']);

// Example: GPIO_PIN = 14, THRESHOLD = 40

/**
 * Monitor temperature and control onboard fan.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = (args) => {
  try {
    log.assert(
      args && args.GPIO_PIN && args.THRESHOLD,
      'fan-control.js requires GPIO_PIN and THRESHOLD specified',
      true,
    );
    const { GPIO_PIN, THRESHOLD } = args;

    const reading = temperature.get();
    const state = reading > THRESHOLD;
    gpio.set(GPIO_PIN, state);
    log.info(`Set fan ${state}, temperature is ${reading}`);
  } catch (e) {
    log.error(e);
  }
};
