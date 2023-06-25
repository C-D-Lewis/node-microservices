const {
  log, ses, conduit,
} = require('../node-common')(['log', 'ses', 'conduit']);
const visuals = require('../modules/visuals');

/** LED state for OK */
const LED_STATE_OK = [0, 255, 0];
/** LED state for DOWN */
const LED_STATE_DOWN = [255, 0, 0];

let lastState = true;

/**
 * Check all local conduit services are alive.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const host = args.HOST || 'localhost';

  // Read apps list
  const { message: apps } = await conduit.send({ to: 'conduit', topic: 'getApps', host });

  // Find apps that are not OK
  const downApps = apps.reduce((result, item) => {
    log.debug(`Service ${item.app} returned ${item.status}`);
    if (item.status !== 'OK') result.push(item.app);

    return result;
  }, []);

  // Set new LED indicator state
  const stateNow = downApps.length === 0;
  const serviceList = apps.map((p) => p.app).join(', ');
  log.info(`Services up: ${stateNow} (${serviceList})`);
  visuals.setLed(
    args.LED,
    stateNow ? LED_STATE_OK : LED_STATE_DOWN,
  );

  // Was OK, not anymore
  if (lastState && !stateNow) {
    await ses.notify(`Services not OK: ${downApps.join(', ')}`);
  }

  // Same as before
  if (stateNow === lastState) return;

  // Changed, update
  lastState = stateNow;
};
