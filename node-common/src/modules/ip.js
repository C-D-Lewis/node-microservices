const requestAsync = require('./requestAsync');
const log = require('./log');

const get = async () => {
  const data = await requestAsync({
    url: 'http://www.canyouseeme.org',
    method: 'get'
  });

  const marker = 'name="IP" value="';
  const start = body.indexOf(marker) + marker.length;
  const ip = body.substring(start, body.indexOf('"/>', start));
  return ip;
};

module.exports = { get };
