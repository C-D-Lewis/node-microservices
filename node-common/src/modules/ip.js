const os = require('os');
const fetch = require('./fetch');
const log = require('./log');

/**
 * Get the public IP address.
 *
 * @returns {Promise<string>} Public IP address.
 */
const getPublic = async () => {
  try {
    const { data: { ip } } = await fetch('https://api.ipify.org?format=json');
    return ip;
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
 * @param {boolean} ignoreLocalCheck - true if local network-likeness check should be skipped (CI)
 * @returns {string} Address of the interface.
 */
const getInterfaceAddress = (ifName, ignoreLocalCheck) => {
  const interfaces = os.networkInterfaces();
  log.debug(`Available interfaces: ${Object.keys(interfaces)}`);
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

  if (!v4.address.includes('192.168') && !ignoreLocalCheck) {
    log.debug(`Address doesn't look like a local network address: ${v4.address}`);
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
    || getInterfaceAddress('wlan1')           // WLAN (dongle)
    || getInterfaceAddress('wlan0')           // WLAN
    || getInterfaceAddress('en0')             // Mac OS WLAN
    || getInterfaceAddress('enp0s3')          // Ubuntu VM Wired
    || getInterfaceAddress('eth0', true)      // Ethernet anyway
    || getInterfaceAddress('lo', true)        // Loopback last resort
  if (!address) throw new Error('No interface available for ip.getLocal()');

  return address;
};

module.exports = {
  getPublic,
  getLocal,
};
