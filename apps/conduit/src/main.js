const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const { checkIn } = require('./modules/fleet');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();
  api.setup();

  // Wait for Attic to come up
  setTimeout(checkIn, FLEET_CHECKIN_DELAY_MS);
};

main();
