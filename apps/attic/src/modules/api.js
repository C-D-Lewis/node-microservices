const { conduit } = require('../node-common')(['conduit']);

/** Schema for messages with no value */
const NO_VALUE_MESSAGE_SCHEMA = {
  required: ['app', 'key'],
  properties: {
    app: { type: 'string' },
    key: { type: 'string' },
  },
};

/** Schema for messages setting a value */
const SET_MESSAGE_SCHEMA = {
  required: ['app', 'key', 'value'],
  properties: {
    app: { type: 'string' },
    key: { type: 'string' },
    value: {},
  }
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('get', require('../api/get'), NO_VALUE_MESSAGE_SCHEMA);
  conduit.on('set', require('../api/set'), SET_MESSAGE_SCHEMA);
  conduit.on('increment', require('../api/increment'), NO_VALUE_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
