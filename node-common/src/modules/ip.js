const os = require('os');
const requestAsync = require('./requestAsync');
const log = require('./log');

const getPublic = async () => {
  const { body } = await requestAsync('http://www.canyouseeme.org');

  const marker = 'name="IP" value="';
  const start = body.indexOf(marker) + marker.length;
  return body.substring(start, body.indexOf('"/>', start));
};

const getInterfaceAddress = (ifName) => {
  const interfaces = os.networkInterfaces();
  const iface = interfaces[ifName];
  if (!iface) {
    log.debug(`Interface ${ifName} not available`);
    return;
  }

  const v4 = iface.find(p => p.family === 'IPv4');
  if (!v4) {
    log.debug(`No IPv4 for ${ifName}`);
    return;
  }

  return v4.address;
};

const getLocal = () => {
  const address = getInterfaceAddress('wlan0') ||
    getInterfaceAddress('eth0') ||
    getInterfaceAddress('en0');

  if (!address) {
    throw new Error('No interface available for ip.getLocal()');
  }

  return address;
};

module.exports = {
  getPublic,
  getLocal,
};
