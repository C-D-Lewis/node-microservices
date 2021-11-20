const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const clacksRelay = require('./modules/clacksRelay');
const { checkIn } = require('./modules/fleet');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();
  await api.setup();

  // Subscribe to clacks
  clacksRelay.setup();

  // Wait for Attic to come up
  setTimeout(checkIn, FLEET_CHECKIN_DELAY_MS);
};

main();
