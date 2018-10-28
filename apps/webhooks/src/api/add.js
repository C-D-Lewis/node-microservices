const {
  attic, conduit, log, schema
} = require('@chris-lewis/node-common')(['attic', 'conduit', 'log', 'schema']);

const webhooks = require('../modules/webhooks');

module.exports = async (packet, res) => {
  log.debug(`<< add: ${JSON.stringify(packet.message)}`);

  const webhook = packet.message;
  if(!schema(packet.message, webhooks.WEBHOOK_SCHEMA)) {
    log.error(`Invalid webhook: ${JSON.stringify(webhook)}`);
    conduit.respond(res, { status: 400, error: 'Bad Request' });
    return;
  }

  // Already exists? Update it
  const hooks = await attic.get(webhooks.ATTIC_KEY_WEBHOOKS);
  const found = hooks.find(item => item.url === webhook.url);
  if(found) {
    found.url = webhook.url;
    found.packet = webhook.packet;
    log.debug(`Updated webhook for url ${webhook.url}`);
  } else {
    // It's new
    hooks.push(webhook);
    log.debug(`Added new webhook for url ${webhook.url}`);
  }

  // Update DB
  await attic.set(webhooks.ATTIC_KEY_WEBHOOKS, hooks);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
