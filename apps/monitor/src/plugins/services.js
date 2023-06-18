const {
  log, fetch, ses,
} = require('../node-common')(['log', 'fetch', 'ses']);
const visuals = require('../modules/visuals');

/** LED state for OK */
const LED_STATE_OK = [0, 255, 0];
/** LED state for DOWN */
const LED_STATE_DOWN = [255, 0, 0];
/** Fixed conduit port */
const PORT = 5959;

let lastState = true;

/**
 * Check all local conduit services are alive.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  const host = args.HOST || 'localhost';

  // Read apps list
  const { data } = await fetch(`http://${host}:${PORT}/apps`);

  // Find apps that are not OK
  const downApps = data.reduce((result, item) => {
    log.debug(`Service ${item.app} returned ${item.status}`);
    if (item.status !== 'OK') result.push(item.app);

    return result;
  }, []);

  // Set new LED indicator state
  const stateNow = downApps.length === 0;
  const serviceList = data.map((p) => p.app).join(', ');
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
