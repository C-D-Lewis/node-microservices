const { log } = require('./node-common')(['log']);
const api = require('./modules/api');
const devices = require('./modules/devices');

const main = () => {
  log.begin();
  api.setup();

  setInterval(() => devices.rediscover(), 1000 * 60 * 10);
  devices.rediscover();
};

main();
