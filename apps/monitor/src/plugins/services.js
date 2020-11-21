const {
  config, fcm, log, requestAsync,
} = require('../node-common')(['config', 'fcm', 'log', 'requestAsync']);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

config.requireKeys('services.js', {
  required: ['OPTIONS', 'CONDUIT'],
  properties: {
    OPTIONS: {
      required: ['LED_STATES'],
      properties: {
        LED_STATES: {
          required: ['OK', 'DOWN'],
          properties: {
            OK: { type: 'array', items: { type: 'number' } },
            DOWN: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
    CONDUIT: {
      required: ['PORT'],
      properties: {
        PORT: { type: 'number' },
      },
    },
  },
});

let lastState = true;

/**
 * Check all local conduit services are alive.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  if (sleep.sleeping()) return;

  const host = args.HOST || 'localhost';
  log.debug(`services host=${host}`);

  const { body } = await requestAsync(`http://${host}:${config.CONDUIT.PORT}/apps`);
  const json = JSON.parse(body);
  const downApps = json.reduce((result, item) => {
    log.debug(`Service ${item.app} returned ${item.status}`);
    if (item.status !== 'OK') result.push(item.app);

    return result;
  }, []);

  const stateNow = downApps.length === 0;
  const serviceList = json.map((p) => p.app).join(', ');
  log.info(`Services up: ${stateNow} (${serviceList})`);
  display.setLed(
    args.LED,
    stateNow ? config.OPTIONS.LED_STATES.OK : config.OPTIONS.LED_STATES.DOWN,
  );

  // Was OK, not anymore
  if (lastState && !stateNow) {
    await fcm.post('Monitor', 'monitor', `Services not OK: ${downApps.join(', ')}`);
  }

  // Same as before
  if (stateNow === lastState) return;

  // Changed, update
  lastState = stateNow;
};
