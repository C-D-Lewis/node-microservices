const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const fleet = require('./modules/fleet');

const main = async () => {
  log.begin();
  api.setup();

  // Wait for Attic to come up
  setTimeout(async () => await fleet.checkIn(), 30000);
};

main();
