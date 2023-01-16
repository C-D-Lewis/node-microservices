const { log, bifrost } = require('./node-common')(['log', 'bifrost']);
const { scheduleCheckins } = require('./modules/fleet');
const { startServer } = require('./modules/server');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await startServer();
  log.info('Ready for clients');

  // TODO: fleet checkin
  await bifrost.connect();

  // Wait for Attic to come up
  setTimeout(scheduleCheckins, FLEET_CHECKIN_DELAY_MS);
};

main();
