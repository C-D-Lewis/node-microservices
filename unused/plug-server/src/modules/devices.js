/* eslint-disable no-underscore-dangle */
const { Client } = require('tplink-smarthome-api');
const { log } = require('../node-common')(['log']);

/** Discover timeout */
const DISCOVERY_TIME_MS = 10000;

const tpLinkClient = new Client();
const knownDevices = [];

/**
 * Get a list of device aliases and states.
 *
 * @returns {Array<Object>} List of { alias, state } objects representing devices.
 */
const getAvailablePlugs = () => knownDevices
  .map((d) => ({ alias: d._sysInfo.alias, state: d._sysInfo.relay_state }));

/**
 * When a new device is discovered.
 *
 * @param {object} device - The new device.
 */
const onNewDevice = (device) => {
  // Already known device? (Although evidence suggests this is handled for us)
  if (knownDevices.find((p) => p._sysInfo.alias === device._sysInfo.alias)) return;

  log.info(`Found new device: ${device._sysInfo.alias}`);
  log.debug(JSON.stringify(device._sysInfo));
  knownDevices.push(device);
};

/**
 * Rediscover devices for a limited time.
 */
const rediscover = () => {
  log.info('Starting discovery...');

  tpLinkClient.startDiscovery();
  tpLinkClient.on('device-new', onNewDevice);

  setTimeout(() => {
    tpLinkClient.stopDiscovery();
    log.info(`Discovery ended. Found ${knownDevices.length} devices.`);
  }, DISCOVERY_TIME_MS);
};

/**
 * Set the state of a device.
 *
 * @param {string} alias - Device alias.
 * @param {boolean} state - New device state.
 */
const setPlugState = (alias, state) => {
  const device = knownDevices.find((p) => p._sysInfo.alias === alias);
  if (!device) throw new Error(`Plug ${alias} not found!`);

  log.debug(`Setting ${alias} to ${state}...`);
  device.setPowerState(state);
  log.debug('Success!');
};

module.exports = {
  rediscover,
  getAvailablePlugs,
  setPlugState,
};
