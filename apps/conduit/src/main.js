const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const fleet = require('./modules/fleet');

const main = async () => {
  log.begin();
  api.setup();

  await fleet.checkIn();
};

main();
