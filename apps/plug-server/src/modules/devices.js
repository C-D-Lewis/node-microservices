const { Client } = require('tplink-smarthome-api');
const { log } = require('../node-common')(['log']);

const DISCOVERY_TIME_MS = 10000;

const tpLinkClient = new Client();
const devices = [];

const getAvailablePlugs = () => devices.map(device => ({
  alias: device._sysInfo.alias,
  state: device._sysInfo.relay_state
}));

const rediscover = () => {
  log.info('Starting discovery...');

  tpLinkClient.startDiscovery();
  tpLinkClient.on('device-new', (device) => {
    // Already known device? (Although evidence suggests this is handled for us)
    if(devices.find(item => item._sysInfo.alias === device._sysInfo.alias)) return;

    log.info(`Found new device: ${device._sysInfo.alias}`);
    log.debug(JSON.stringify(device._sysInfo));
    devices.push(device);
  });

  setTimeout(() => {
    tpLinkClient.stopDiscovery();
    log.info(`Discovery ended. Found ${devices.length} devices.`);
  }, DISCOVERY_TIME_MS);
};

const setPlugState = (alias, state) => {
  const device = devices.find(device => device._sysInfo.alias === alias);
  if(!device) throw new Error(`Plug ${alias} not found!`);

  log.debug(`Setting ${alias} to ${state}...`);
  device.setPowerState(state);
  log.debug('Success!');
};

module.exports = { rediscover, getAvailablePlugs, setPlugState };
