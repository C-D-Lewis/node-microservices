const {
  attic, conduit, log, schema,
} = require('../node-common')(['attic', 'conduit', 'log', 'schema']);
const { ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA } = require('../modules/webhooks');

/**
 * Handle a packet to add a new webhook.
 *
 * @param {object} message - Packet message, which is a webhook object.
 */
const handlePacketWebhook = async (message) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  const found = hooks.find((p) => p.url === message.url);
  if (!found) {
    hooks.push(message);
    log.info(`Added new webhook for url ${message.url}`);
  } else {
    found.url = message.url;
    found.packet = message.packet;
    log.info(`Updated webhook for url ${message.url}`);
  }

  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
};

/**
 * Handle a 'add' packet.
 *
 * @param {object} packet - The conduit packet request.
 * @param {object} res - Express response object.
 */
const handleAddPacket = async (packet, res) => {
  const { message } = packet;
  if (!schema(message, WEBHOOK_SCHEMA)) {
    log.error(`Invalid webhook: ${JSON.stringify(message)}`);
    conduit.respond(res, { status: 400, error: 'Bad Request' });
    return;
  }

  await handlePacketWebhook(message);

  conduit.respond(res, { status: 201, message: { content: 'Created' } });
};

module.exports = {
  handleAddPacket,
  handlePacketWebhook,
};
