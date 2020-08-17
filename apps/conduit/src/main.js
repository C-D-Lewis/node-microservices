const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const { checkIn } = require('./modules/fleet');
const { placeTasks } = require('./modules/peers');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();
  await api.setup();

  placeTasks();

  // Wait for Attic to come up
  setTimeout(checkIn, FLEET_CHECKIN_DELAY_MS);
};

main();
