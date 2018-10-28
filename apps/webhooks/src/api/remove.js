const {
  attic, conduit, log
} = require('@chris-lewis/node-common')(['attic', 'conduit', 'log']);

const webhooks = require('../modules/webhooks');

module.exports = async (packet, res) => {
  log.debug(`<< remove: ${JSON.stringify(packet.message)}`);

  // Already exists?
  const hooks = await attic.get(webhooks.ATTIC_KEY_WEBHOOKS);
  const found = hooks.find(item => item.url === packet.message.url);
  if (!found) {
    conduit.respond(res, { status: 404, error: 'Not Found' });
    return;
  }

  // Update app and DB
  hooks.splice(hooks.indexOf(found), 1);
  await attic.set(webhooks.ATTIC_KEY_WEBHOOKS, hooks);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
