const {
  attic, log, schema,
} = require('../node-common')(['attic', 'log', 'schema']);
const { ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA } = require('../modules/webhooks');

/**
 * Handle a packet to add a new webhook.
 *
 * @param {object} message - Packet message, which is a webhook object.
 */
const handlePacketWebhook = async (message) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  const found = hooks.find((p) => p.url === message.url);

  // Add it, else update it
  if (!found) {
    hooks.push(message);
    log.info(`Added new webhook for ${message.url}`);
  } else {
    found.url = message.url;
    found.packet = message.packet;
    log.info(`Updated webhook for ${message.url}`);
  }

  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
};

/**
 * Handle a 'add' packet.
 *
 * @param {object} packet - The conduit packet request.
 * @returns {object} Response messsage data.
 */
const handleAddPacket = async (packet) => {
  const { message } = packet;
  if (!schema(message, WEBHOOK_SCHEMA)) {
    log.error(`Invalid webhook: ${JSON.stringify(message)}`);
    return { error: 'Bad Request' };
  }

  await handlePacketWebhook(message);

  return { content: 'Created' };
};

module.exports = {
  handleAddPacket,
  handlePacketWebhook,
};
