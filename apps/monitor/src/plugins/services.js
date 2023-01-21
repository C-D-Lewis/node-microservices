const {
  log, bifrost, ses,
} = require('../node-common')(['log', 'bifrost', 'ses']);
const visuals = require('../modules/visuals');

/** LED state for OK */
const LED_STATE_OK = [0, 255, 0];
/** LED state for DOWN */
const LED_STATE_DOWN = [255, 0, 0];

const { TOPIC_KNOWN_APPS } = bifrost;

let lastState = true;
let maxSeen = 0;

/**
 * Check all local bifrost services are alive.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  // Read apps list
  const { apps } = await bifrost.send({ to: 'bifrost', topic: TOPIC_KNOWN_APPS });

  // Bad state if less than the most seen are connected
  const seenNow = apps.length;
  const stateNow = seenNow >= maxSeen;
  maxSeen = Math.max(maxSeen, seenNow);

  // Set new LED indicator state
  const appList = apps.join(', ');
  log.info(`Services up: ${stateNow} (${appList})`);
  try {
    await visuals.setLed(
      args.LED,
      stateNow ? LED_STATE_OK : LED_STATE_DOWN,
    );
  } catch (e) {
    log.error('Failed to set services.js status LED');
  }

  // Was OK, not anymore
  if (lastState && !stateNow) {
    await ses.notify(`Services not OK: ${appList}`);
  }

  // Same as before
  if (stateNow === lastState) return;

  // Changed, update
  lastState = stateNow;
};
