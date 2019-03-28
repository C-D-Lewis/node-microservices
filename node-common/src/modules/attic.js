const conduit = require('./conduit');
const config = require('./config');

let host = 'localhost';

const setHost = (url) => {
  host = url;
};

const set = async (key, value) => conduit.send({
  host,
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
    host,
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
    await module.exports.get(key);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = { set, get, exists, setHost };
