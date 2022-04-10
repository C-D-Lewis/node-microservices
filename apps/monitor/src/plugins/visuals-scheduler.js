const { log } = require('../node-common')(['log']);
const conduitPost = require('./conduit');

/** Off color */
const LED_STATE_OFF = [0, 0, 0];

/**
 * Do something when the hours and minutes occur.
 *
 * @param {Array<string>} time - Times string portions.
 * @param {string} hours - Hours string.
 * @param {string} minutes - Minutes string.
 * @returns {boolean} true if it is time to run.
 */
const isTime = ([hours, minutes]) => {
  const now = new Date();
  return now.getHours() === parseInt(hours, 10) && now.getMinutes() === parseInt(minutes, 10);
};

/**
 * Set LEDs to colors at given times.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = (args) => {
  const { EVENTS = [] } = args;

  EVENTS.forEach(async (event) => {
    // Check configuration
    const {
      NAME, ON, OFF, COLOR,
    } = event;
    log.assert(ON.length === 5 && ON.includes(':'), 'ON must be HH:MM', true);
    log.assert(OFF.length === 5 && OFF.includes(':'), 'OFF must be HH:MM', true);
    log.assert(
      COLOR.length === 3 && COLOR.every((c) => typeof c === 'number'),
      'COLOR must be 3 numbers',
      true,
    );

    // Time to be ON?
    if (isTime(ON.split(':'))) {
      log.info(`Time for ON: ${NAME}`);
      await conduitPost({
        to: 'visuals',
        topic: 'fadeAll',
        message: { to: COLOR },
      });
    }

    // Time to be OFF?
    if (isTime(OFF.split(':'))) {
      log.info(`Time for OFF: ${NAME}`);
      await conduitPost({
        to: 'visuals',
        topic: 'fadeAll',
        message: { to: LED_STATE_OFF },
      });
    }
  });
};
