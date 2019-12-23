const { attic, conduit } = require('../node-common')(['attic', 'conduit']);
const { ATTIC_KEY_WEBHOOKS } = require('../modules/webhooks');

/**
 * Handle a 'remove' packet.
 *
 * @param {Object} packet - The conduit packet request.
 * @param {Object} res - Express response object.
 */
const handleRemovePacket = async (packet, res) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  const found = hooks.find(p => p.url === packet.message.url);
  if (!found) {
    conduit.respond(res, { status: 404, error: 'Not Found' });
    return;
  }

  hooks.splice(hooks.indexOf(found), 1);

  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
  // Note - Can't be 204 otherwise the body gets discarded
  conduit.respond(res, { status: 200, message: { content: 'Removed' } });
};

module.exports = handleRemovePacket;
