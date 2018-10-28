const { conduit } = require('@chris-lewis/node-common')(['conduit']);

const GET_MESSAGE_SCHEMA = {
  required: [ 'app', 'key' ],
  type: 'object', properties: {
    app: { type: 'string' },
    key: { type: 'string' }
  }
};

const SET_MESSAGE_SCHEMA = {
  required: [ 'app', 'key', 'value' ],
  type: 'object', properties: {
    app: { type: 'string' },
    key: { type: 'string' },
    value: {}
  }
};

const INCREMENT_MESSAGE_SCHEMA = {
  required: [ 'app', 'key' ],
  type: 'object', properties: {
    app: { type: 'string' },
    key: { type: 'string' }
  }
};

const setup = async () => {
  await conduit.register();

  conduit.on('get', require('../api/get'), GET_MESSAGE_SCHEMA);
  conduit.on('set', require('../api/set'), SET_MESSAGE_SCHEMA);
  conduit.on('increment', require('../api/increment'), INCREMENT_MESSAGE_SCHEMA);
};

module.exports = { setup };
