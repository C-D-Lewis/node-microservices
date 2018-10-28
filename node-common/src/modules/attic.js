const conduit = require('./conduit');
const config = require('./config');

let host = 'localhost';

const setHost = url => host = url;

const set = async (key, value) => conduit.send({
  host, to: 'Attic', topic: 'set',
  message: { app: config.CONDUIT.APP, key, value }
});

const get = async (key) => {
  const response = await conduit.send({
    host, to: 'Attic', topic: 'get',
    message: { app: config.CONDUIT.APP, key }
  });

  if(response.error) throw new Error(response.error);
  return response.message.value;
};

const exists = async key => module.exports.get(key);

module.exports = { set, get, exists, setHost };
