const { attic, conduit, log } = require('../node-common')(['attic', 'conduit', 'log']);
const { ATTIC_KEY_WEBHOOKS } = require('../modules/webhooks');

module.exports = async (packet, res) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  const found = hooks.find(item => item.url === packet.message.url);
  if (!found) {
    conduit.respond(res, { status: 404, error: 'Not Found' });
    return;
  }

  hooks.splice(hooks.indexOf(found), 1);
  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
