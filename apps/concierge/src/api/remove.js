const { attic } = require('../node-common')(['attic']);
const { ATTIC_KEY_WEBHOOKS } = require('../modules/webhooks');

/**
 * Handle a 'remove' packet.
 *
 * @param {object} packet - The conduit packet request.
 * @returns {object} Response message data.
 */
const handleRemovePacket = async (packet) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  const found = hooks.find((p) => p.url === packet.message.url);
  if (!found) {
    return { error: 'Not Found' };
  }

  // Remove it
  hooks.splice(hooks.indexOf(found), 1);
  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);

  return { content: 'Removed' };
};

module.exports = handleRemovePacket;
