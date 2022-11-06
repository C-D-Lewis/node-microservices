const os = require('os');
const requestAsync = require('./requestAsync');
const log = require('./log');

/**
 * Get the public IP address.
 *
 * @returns {Promise<string>} Public IP address.
 */
const getPublic = async () => {
  try {
    const { body } = await requestAsync('https://api.ipify.org?format=json');
    return JSON.parse(body).ip;
  } catch (e) {
    log.error('Failed to get public IP');
    log.error(e);
    return 'unknown';
  }
};

/**
 * Get address from an interface.
 *
 * @param {string} ifName - Interface name, such as wlan0
 * @returns {string} Address of the interface.
 */
const getInterfaceAddress = (ifName) => {
  const interfaces = os.networkInterfaces();
  const iface = interfaces[ifName];
  if (!iface) {
    log.debug(`Interface ${ifName} not available`);
    return undefined;
  }

  const v4 = iface.find((p) => p.family === 'IPv4');
  if (!v4) {
    log.debug(`No IPv4 for ${ifName}`);
    return undefined;
  }

  return v4.address;
};

/**
 * Get local IP.
 *
 * @returns {string} Local IP address, if one of the tried interfaces has one.
 */
const getLocal = () => {
  const address = getInterfaceAddress('eth0') // Ethernet
    || getInterfaceAddress('wlan0')           // WLAN
    || getInterfaceAddress('wlan1')           // WLAN (dongle)
    || getInterfaceAddress('en0')             // Mac OS WLAN
    || getInterfaceAddress('enp0s3');         // Ubuntu VM Wired
  if (!address) throw new Error('No interface available for ip.getLocal()');

  return address;
};

module.exports = {
  getPublic,
  getLocal,
};
