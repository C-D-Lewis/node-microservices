const {
  attic, conduit, log, schema,
} = require('@chris-lewis/node-common')(['attic', 'conduit', 'log', 'schema']);

const { ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA } = require('../modules/webhooks');

const handleMessage = (hooks, message) => {
  const found = hooks.find(item => item.url === message.url);

  // Already exists? Update it
  if (found) {
    found.url = message.url;
    found.packet = message.packet;
    log.info(`Updated webhook for url ${message.url}`);
    return;
  }

  // It's new
  hooks.push(message);
  log.info(`Added new webhook for url ${message.url}`);
};

module.exports = async (packet, res) => {
  log.debug(`<< add: ${JSON.stringify(packet.message)}`);

  const { message } = packet;
  if (!schema(message, WEBHOOK_SCHEMA)) {
    log.error(`Invalid webhook: ${JSON.stringify(message)}`);
    conduit.respond(res, { status: 400, error: 'Bad Request' });
    return;
  }

  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  handleMessage(hooks, message);

  // Update DB
  await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
