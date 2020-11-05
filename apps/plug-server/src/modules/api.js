const { conduit, schema } = require('../node-common')(['conduit', 'schema']);

/** Empty message schema. */
const EMPTY_MESSAGE_SCHEMA = { type: 'object' };

/** setPlugState schema */
const SET_PLUG_STATE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['alias', 'state'],
  properties: {
    alias: { type: 'string' },
    state: { type: 'boolean' },
  },
};

/**
 * Setup the conduit API.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('getPlugs', require('../api/getPlugs'), EMPTY_MESSAGE_SCHEMA);
  conduit.on('setPlugState', require('../api/setPlugState'), SET_PLUG_STATE_MESSAGE_SCHEMA);
  conduit.on('rediscover', require('../api/rediscover'), EMPTY_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
