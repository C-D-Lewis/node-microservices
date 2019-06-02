const conduit = require('./conduit');
const config = require('./config');

const DEFAULT_HOST = 'localhost';

let host = DEFAULT_HOST;

const setHost = (newHost) => {
  host = newHost;
};

const set = async (key, value) => conduit.send({
  to: 'attic',
  topic: 'set',
  message: {
    key,
    value,
    app: config.CONDUIT.APP,
  },
});

const get = async (key) => {
  const res = await conduit.send({
    to: 'attic',
    topic: 'get',
    message: {
      key,
      app: config.CONDUIT.APP,
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
};
