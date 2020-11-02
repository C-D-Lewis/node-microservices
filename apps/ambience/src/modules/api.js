const { conduit } = require('../node-common')(['conduit']);

/** Schema for a packet with no message. */
const NO_PACKET_SCHEMA = { type: 'object' };

/**
 * Register with Conduit and setup topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('spotify', require('../api/spotify'), NO_PACKET_SCHEMA);
};

module.exports = {
  setup,
};
