const config = require('./config');
const requestAsync = require('./requestAsync');

config.requireKeys('conduit.js', {
  required: ['EVT_DB'],
  properties: {
    EVT_DB: {
      required: ['THNG_ID', 'DEVICE_API_KEY'],
      properties: {
        DEVICE_API_KEY: { type: 'string' },
      },
    },
  },
});

const API_URL = 'https://api.evrythng.com';

let thngId = '';

const evtRequest = async (method, path, body) => {
  const data = await requestAsync({
    method,
    url: `${API_URL}${path}`,
    headers: {
      Authorization: config.EVT_DB.DEVICE_API_KEY,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : ''
  });

  return JSON.parse(data.body);
};

const init = async () => {
  const res = await evtRequest('GET', '/access');
  if (res.errors) {
    throw new Error('EVT_DB DEVICE_API_KEY is invalid!');
  }

  thngId = res.actor.id;
};

const get = async (key) => {
  const path = `/thngs/${thngId}/properties/${key.toLowerCase()}`;
  const res = await evtRequest('GET', path);
  if (!res.length) {
    throw new Error(`Property ${key} does not exist`);
  }

  return res[0].value;
};

const set = async (key, value) => {
  const path = `/thngs/${thngId}/properties/${key.toLowerCase()}`;
  const res = await evtRequest('PUT', path, [{ value }]);
  if (res.errors) {
    throw new Error(res.errors[0]);
  }

  return res;
};

const exists = async (key) => {
  try {
    await get(key);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  init,
  get,
  set,
  exists,
};
