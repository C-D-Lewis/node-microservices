const { hostname } = require('os');
const {
  clacks, log,
} = require('../node-common')(['config', 'clacks', 'log']);
const handlePacketRequest = require('../api/conduit');

/** Clacks topic for this conduit server */
const TOPIC_THIS_CONDUIT = `/devices/${hostname()}/conduit`;
/** Mock Express res object */
const MOCK_RES = {
  status: () => ({
    json: () => {},
    send: () => {},
  }),
};

/**
 * When a message arrives, it is a conduit packet.
 *
 * @param {object} packet - Packet received for forwarding.
 */
const onConduitClacksMessage = (packet) => {
  log.debug(`Forwarding clacks packet: ${JSON.stringify(packet)}`);

  handlePacketRequest(
    { body: packet },
    MOCK_RES,
  );
};

/**
 * Subscribe to receive and forward from clacks.
 */
const setup = async () => {
  try {
    await clacks.connect();

    clacks.subscribeTopic(TOPIC_THIS_CONDUIT, onConduitClacksMessage);
    log.info('Ready for clacks packets');
  } catch (e) {
    log.error(e);
    log.error('Failed to connect to clacks');
  }
};

module.exports = {
  setup,
};
