const { conduit } = require('../node-common')(['conduit']);

const _TO_MESSAGE_SCHEMA  = {
  additionalProperties: false,
  required: ['all'],
  properties: {
    all: { type: 'array', items: { type: 'integer' } },
  },
};

const _NO_MESSAGE_SCHEMA = { type: 'object' };

const setup = async () => {
  await conduit.register();

  conduit.on('set', require('../api/set'), _TO_MESSAGE_SCHEMA);
  conduit.on('fade', require('../api/fade'), _TO_MESSAGE_SCHEMA);
  conduit.on('spotify', require('../api/spotify'), _NO_MESSAGE_SCHEMA);
  conduit.on('demo', require('../api/demo'), _NO_MESSAGE_SCHEMA);
  conduit.on('off', require('../api/off'), _NO_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
