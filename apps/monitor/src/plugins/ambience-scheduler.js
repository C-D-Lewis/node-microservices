const { log } = require('../node-common')(['log']);
const conduitPost = require('./conduit');

/** Off color */
const OFF_COLOR = [0, 0, 0];

/**
 * Do something when the hours and minutes occur.
 */
const isTime = (hours, minutes) => {
  const now = new Date();
  return now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes);
};

/**
 * Set LEDs to colors at given times.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = (args) => {
  const { EVENTS = [] } = args;

  EVENTS.forEach(async (event) => {
    const { NAME, ON, OFF, COLOR } = event;
    log.assert(ON.length === 5 && ON.includes(':'), 'ON must be HH:MM', true);
    log.assert(OFF.length === 5 && OFF.includes(':'), 'OFF must be HH:MM', true);
    log.assert(
      COLOR.length === 3 && COLOR.every(c => typeof c === 'number'),
      'COLOR must be 3 numbers',
      true
    );

    const [onAtHours, onAtMinutes] = ON.split(':');
    const [offAtHours, offAtMinutes] = OFF.split(':');
    if (isTime(onAtHours, onAtMinutes)) {
      log.info(`Time for ON: ${NAME}`);
      await conduitPost({
        to: 'ambience',
        topic: 'fade',
        message: { all: COLOR },
      });
    }

    if (isTime(offAtHours, offAtMinutes)) {
      log.info(`Time for OFF: ${NAME}`);
      await conduitPost({
        to: 'ambience',
        topic: 'fade',
        message: { all: OFF_COLOR },
      });
    }
  });
};
