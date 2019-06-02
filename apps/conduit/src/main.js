const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const fleet = require('./modules/fleet');

const main = async () => {
  log.begin();
  api.setup();

  // Register once attic is up
  setTimeout(async () => fleet.checkIn(), 20000);
};

main();
