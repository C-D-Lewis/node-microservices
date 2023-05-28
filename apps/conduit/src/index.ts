import common from './node-common';
import api from './modules/api';
const clacksRelay = require('./modules/clacksRelay');
const { scheduleCheckins } = require('./modules/fleet');

const { log, config } = common(['log', 'config']);

/** Time to wait before updating the fleet registry */
const FLEET_CHECKIN_DELAY_MS = 30000;

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await api.setup();

  clacksRelay.setup();

  if (!process.env.DOCKER_TEST) {
    // Wait for Attic to come up
    setTimeout(scheduleCheckins, FLEET_CHECKIN_DELAY_MS);
  }

  config.validate();
};

main();
