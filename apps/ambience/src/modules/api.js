const { conduit } = require('../node-common')(['conduit']);

/** Schema for a 'to' packet */
const TO_PACKET_SCHEMA  = {
  additionalProperties: false,
  required: ['all'],
  properties: {
    all: { type: 'array', items: { type: 'integer' } },
  },
};

/** Schema for a packet with no message. */
const NO_PACKET_SCHEMA = { type: 'object' };

/**
 * Register with Conduit and setup topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('set', require('../api/set'), TO_PACKET_SCHEMA);
  conduit.on('spotify', require('../api/spotify'), NO_PACKET_SCHEMA);
  conduit.on('demo', require('../api/demo'), NO_PACKET_SCHEMA);
};

module.exports = {
  setup,
};
