const request = require('request');

const config = require('./config');
const log = require('./log');
const requestAsync = require('./requestAsync');

config.requireKeys('conduit.js', {
  required: [ 'EVT_DB' ],
  type: 'object', properties: {
    EVT_DB: {
      required: [ 'THNG_ID', 'DEVICE_API_KEY' ],
      type: 'object', properties: {
        THNG_ID: { type: 'string' },
        DEVICE_API_KEY: { type: 'string' }
      }
    }
  }
});

const API_URL = 'https://api.evrythng.com';

const evtRequest = async (method, path, body) => {
  const data = await requestAsync({
    url: `${API_URL}${path}`,
    method,
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
  if(res.errors) log.fatal('EVT_DB DEVICE_API_KEY is invalid!');
};

const get = async (key) => {
  const res = await evtRequest('GET', `/thngs/${config.EVT_DB.THNG_ID}/properties/${key.toLowerCase()}`);
  if(!res.length) throw new Error(`Property ${key} does not exist`);

  return res[0].value;
};

const set = async (key, value) => {
  const res = await evtRequest('PUT', `/thngs/${config.EVT_DB.THNG_ID}/properties/${key.toLowerCase()}`, [{ value }]);
  if(res.errors) throw new Error(res.errors[0]);

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
