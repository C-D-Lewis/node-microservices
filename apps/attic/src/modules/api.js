const { bifrost } = require('../node-common')(['bifrost']);

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
  },
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await bifrost.connect();

  bifrost.registerTopic('get', require('../api/get'), NO_VALUE_MESSAGE_SCHEMA);
  bifrost.registerTopic('listApps', require('../api/listApps'), {});
  bifrost.registerTopic('set', require('../api/set'), SET_MESSAGE_SCHEMA);
  bifrost.registerTopic('increment', require('../api/increment'), NO_VALUE_MESSAGE_SCHEMA);
};

module.exports = { setup };
