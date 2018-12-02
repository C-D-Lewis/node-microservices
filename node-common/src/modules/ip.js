const requestAsync = require('./requestAsync');

const get = async () => {
  const { body } = await requestAsync('http://www.canyouseeme.org');

  const marker = 'name="IP" value="';
  const start = body.indexOf(marker) + marker.length;
  return body.substring(start, body.indexOf('"/>', start));
};

module.exports = {
  get,
};
