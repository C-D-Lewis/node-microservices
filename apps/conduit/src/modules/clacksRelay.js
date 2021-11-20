const {
  config, clacks, log,
} = require('../node-common')(['config', 'clacks', 'log']);
const handlePacketRequest = require('../api/conduit');

const {
  CLACKS: { HOSTNAME },
} = config;

/** Clacks topic for this conduit server */
const TOPIC_THIS_CONDUIT = `/devices/${HOSTNAME}/conduit`;
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
  await clacks.connect();

  clacks.subscribeTopic(TOPIC_THIS_CONDUIT, onConduitClacksMessage);
  log.info('Ready for clacks packets');
};

module.exports = {
  setup,
};
