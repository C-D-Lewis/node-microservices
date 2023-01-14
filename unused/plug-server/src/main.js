const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const devices = require('./modules/devices');

/** Interval between discoveries */
const DISCOVER_INTERVAL_MS = 1000 * 60 * 10;

/**
 * The main function.
 */
const main = () => {
  log.begin();
  api.setup();

  // Continual device discovery at intervals
  setInterval(() => devices.rediscover(), DISCOVER_INTERVAL_MS);
  devices.rediscover();
};

main();
