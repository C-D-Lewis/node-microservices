const {
  config, conduit, fcm, log, requestAsync
} = require('@chris-lewis/node-common')(['config', 'conduit', 'fcm', 'log', 'requestAsync']);

const sleep = require('../modules/sleep');

config.requireKeys('services.js', {
  required: [ 'LED_STATES', 'CONDUIT' ],
  type: 'object', properties: {
    LED_STATES: {
      required: [ 'OK', 'DOWN' ],
      type: 'object', properties: {
        OK: { type: 'array', items: { type: 'number' } },
        DOWN: { type: 'array', items: { type: 'number' } }
      }
    },
    CONDUIT: {
      required: [ 'PORT' ],
      type: 'object', properties: {
        PORT: { type: 'number' }
      }
    }
  }
});

let savedState = true;

module.exports = async (args) => {
  if (sleep.sleeping()) {
    return;
  }

  const host = args.HOST || 'localhost';
  log.debug(`services host=${host}`);

  const { body } = await requestAsync(`http://${host}:${config.CONDUIT.PORT}/apps`);
  const downApps = JSON.parse(body)
    .reduce((result, item) => {
      log.debug(`Service ${item.app} returned ${item.status}`);
      if (item.status !== 'OK') {
        result.push(item.app);
      }

      return result;
    }, []);

  const stateNow = downApps.length === 0;
  log.info(`Services up: ${stateNow}`);
  await conduit.send({
    to: 'LedServer', topic: 'setPixel',
    message: { [args.LED]: stateNow ? config.LED_STATES.OK : config.LED_STATES.DOWN }
  });

  // Was OK, not anymore
  if (savedState && !stateNow) {
    await fcm.post('Monitor', 'monitor', `Services not OK: ${downApps.join(', ')}`);
  }

  // Same as before
  if (stateNow === savedState) {
    return;
  }

  // Changed, update
  savedState = stateNow;
};
