const { bifrost, log } = require('./node-common')(['config', 'bifrost', 'log']);
const plugins = require('./modules/plugins');
const api = require('./modules/api');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await api.setup();

  // Clear any LEDs (still needed?)
  try {
    await bifrost.send({
      to: 'visuals',
      topic: 'setAll',
      message: { all: [0, 0, 0] },
    });
  } catch (e) {
    log.error(e);
    log.error('Failed to initialise visuals to 0s');
  }

  plugins.loadAll();
};

main();
