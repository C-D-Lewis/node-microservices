// eslint-disable-next-line import/no-extraneous-dependencies
require('colors');
const { log, config } = require('./node-common')(['log', 'config']);
const { scheduleCheckins } = require('./modules/fleet');
const { openTheBifrost } = require('./modules/bifrost');
const { startServer, connectToHostServer } = require('./modules/server');

const { OPTIONS } = config.get(['OPTIONS']);

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

  await connectToHostServer();

  // await api.setup();

  // FIXME: Wait for Attic to come up then check into fleet
  if (OPTIONS.FLEET.HOST.length) setTimeout(scheduleCheckins, FLEET_CHECKIN_DELAY_MS);
};

main();
