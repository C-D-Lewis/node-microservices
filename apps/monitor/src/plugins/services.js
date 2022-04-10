const {
  config, log, requestAsync,
} = require('../node-common')(['config', 'log', 'requestAsync']);
const display = require('../modules/display');

config.requireKeys('services.js', {
  required: ['CONDUIT'],
  properties: {
    CONDUIT: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

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
  log.debug(`services host=${host}`);

  // Read apps list
  const { body } = await requestAsync(`http://${host}:${config.CONDUIT.PORT}/apps`);
  const json = JSON.parse(body);

  // Find apps that are not OK
  const downApps = json.reduce((result, item) => {
    log.debug(`Service ${item.app} returned ${item.status}`);
    if (item.status !== 'OK') result.push(item.app);

    return result;
  }, []);

  // Set new LED indicator state
  const stateNow = downApps.length === 0;
  const serviceList = json.map((p) => p.app).join(', ');
  log.info(`Services up: ${stateNow} (${serviceList})`);
  display.setLed(
    args.LED,
    stateNow ? LED_STATE_OK : LED_STATE_DOWN,
  );

  // Was OK, not anymore
  if (lastState && !stateNow) {
    // TODO: Some other notification mechanism in the future
    // await .post('Monitor', 'monitor', `Services not OK: ${downApps.join(', ')}`);
  }

  // Same as before
  if (stateNow === lastState) return;

  // Changed, update
  lastState = stateNow;
};
