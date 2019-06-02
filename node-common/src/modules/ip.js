const os = require('os');
const requestAsync = require('./requestAsync');

const getPublic = async () => {
  const { body } = await requestAsync('http://www.canyouseeme.org');

  const marker = 'name="IP" value="';
  const start = body.indexOf(marker) + marker.length;
  return body.substring(start, body.indexOf('"/>', start));
};

const getInterfaceAddress = (ifName) => {
  const iface = os.networkInterfaces()[ifName];

  const v4 = iface.find(p => p.family === 'IPv4');
  if (!v4) {
    throw new Error(`No IPv4 for ${ifName}`);
  }

  return v4.address;
};

const getLocal = () => {
  try {
    return getInterfaceAddress('wlan0');
  } catch (e) {
    console.log(e.message);
    try {
      return getInterfaceAddress('eth0');
    } catch (e2) {
      console.log(e2.message);
      throw new Error('No interface available for ip.getLocal()');
    }
  }
};

module.exports = {
  getPublic,
  getLocal,
};
