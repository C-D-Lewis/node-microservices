const config = require('./config');
const requestAsync = require('./requestAsync');

config.requireKeys('attic.js', {
  required: ['CONDUIT'],
  properties: {
    CONDUIT: {
      required: ['APP'],
      properties: {
        APP: { type: 'string' },
        TOKEN: { type: 'string' },
      },
    },
  },
});

const CONDUIT_PORT = 5959;

let host = 'localhost';
let appName = config.CONDUIT.APP || 'Unknown';

// Even conduit shouldn't have to register with conduit
const conduitSend = async packet => {
  packet.auth = config.CONDUIT.TOKEN || '';

  const { body } = await requestAsync({
    url: `http://${host}:${CONDUIT_PORT}/conduit`,
    method: 'post',
    json: packet,
  });

  return body;
};

const setHost = (newHost) => {
  host = newHost;
};

const setAppName = (newAppName) => {
  appName = newAppName;
};

const set = async (key, value) => conduitSend({
  to: 'attic',
  topic: 'set',
  message: {
    key,
    value,
    app: appName,
  },
});

const get = async (key) => {
  const res = await conduitSend({
    to: 'attic',
    topic: 'get',
    message: {
      app: appName,
      key,
    },
  });

  if(res.error) {
    throw new Error(res.error);
  }

  return res.message.value;
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
  set,
  get,
  exists,
  setHost,
  setAppName,
};
