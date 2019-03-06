const { conduit, schema } = require('../node-common')(['conduit', 'schema']);

const _OBJECT_SCHEMA = { type: 'object' };

const SET_PLUG_STATE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['alias', 'state'],
  properties: {
    alias: { type: 'string' },
    state: { type: 'boolean' },
  },
};

const setup = async () => {
  await conduit.register();

  conduit.on('getPlugs', require('../api/getPlugs'), _OBJECT_SCHEMA);
  conduit.on('setPlugState', require('../api/setPlugState'), SET_PLUG_STATE_MESSAGE_SCHEMA);
  conduit.on('rediscover', require('../api/rediscover'), _OBJECT_SCHEMA);
};

module.exports = { setup };
