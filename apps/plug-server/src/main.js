const {
  log
} = require('@chris-lewis/node-common')(['log']);

const api = require('./modules/api');
const devices = require('./modules/devices');

(() => {
  log.begin();
  api.setup();

  setInterval(() => devices.rediscover(), 1000 * 60 * 10);
  devices.rediscover();
})();
