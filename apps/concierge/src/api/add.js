const {
  attic, conduit, log, schema,
} = require('../node-common')(['attic', 'conduit', 'log', 'schema']);
const { ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA } = require('../modules/webhooks');

/**
 * Handle a packet to add a new webhook.
 */
const handlePacketMessage = (hooks, message) => {
  const found = hooks.find(p => p.url === message.url);
  if (!found) {
    hooks.push(message);
    log.info(`Added new webhook for url ${message.url}`);
    return;
  }

  found.url = message.url;
  found.packet = message.packet;
  log.info(`Updated webhook for url ${message.url}`);
};

/**
 * Handle a 'add' packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleAddPacket = async (packet, res) => {
  const { message } = packet;
  if (!schema(message, WEBHOOK_SCHEMA)) {
    log.error(`Invalid webhook: ${JSON.stringify(message)}`);
    conduit.respond(res, { status: 400, error: 'Bad Request' });
    return;
  }

  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  handlePacketMessage(hooks, message);

  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
  conduit.respond(res, { status: 201, message: { content: 'Created' } });
};

module.exports = handleAddPacket;
