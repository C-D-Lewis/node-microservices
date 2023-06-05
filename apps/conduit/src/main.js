const { log, config } = require('./node-common')(['log', 'config']);
const api = require('./modules/api');
const clacksRelay = require('./modules/clacksRelay');
const { scheduleCheckins } = require('./modules/fleet');

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin({ appName: 'conduit' });

  await api.setup();

  clacksRelay.setup();

  if (!process.env.DOCKER_TEST) {
    // Wait for Attic to come up
    setTimeout(scheduleCheckins, FLEET_CHECKIN_DELAY_MS);
  }

  config.validate();
};

main();
