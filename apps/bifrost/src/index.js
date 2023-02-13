// eslint-disable-next-line import/no-extraneous-dependencies
require('colors');
const { log, bifrost } = require('./node-common')(['log', 'bifrost']);
const { scheduleCheckins } = require('./modules/fleet');
const { openTheBifrost } = require('./modules/bifrost');
const { startServer } = require('./modules/server');
const api = require('./modules/api');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();
  openTheBifrost();

  await startServer();
  log.info('Ready for clients');

  await api.setup();

  // FIXME: Wait for Attic to come up then check into fleet
  setTimeout(scheduleCheckins, FLEET_CHECKIN_DELAY_MS);
};

main();
