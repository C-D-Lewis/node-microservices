const bodyParser = require('body-parser');
const {
  attic, conduit, config, log, server,
} = require('../node-common')(['attic', 'conduit', 'config', 'log', 'server']);

const ATTIC_KEY_WEBHOOKS = 'webhooks';
const WEBHOOK_SCHEMA = {
  additionalProperties: false,
  required: ['url', 'packet'],
  properties: {
    url: { type: 'string' },
    packet: {
      additionalProperties: false,
      required: ['to', 'topic'],
      properties: {
        to: { type: 'string' },
        topic: { type: 'string' },
      },
    },
  },
};

/**
 * Handle any request at all and compare against known hooks.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 */
const handleRequest = async (req, res) => {
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  if (!hooks.length) {
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  const { path } = req;
  const found = hooks.find(p => p.url === path)
  if (!found) {
    log.error(`Webhook does not exist for URL ${path}`);
    res.status(404).json({ error: 'Not Found' });
    return;
  }

  found.packet.message = found.packet.message || {};
  found.packet.message.webhookQuery = req.query;

  log.info(`Forwarding webhook to ${found.packet.to}`);
  await conduit.send(found.packet);
  server.respondOk(res);
};

/**
 * Set up routes for hooks read from DB.
 */
const setup = async () => {
  server.start();

  try {
    const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
    if (hooks.length) {
      log.info('Known webhooks:');
      hooks.forEach(p => log.info(`  POST ${p.url}`));
    }
  } catch (e) {
    log.info('Initialising empty list of webhooks');
    hooks = [];
    await attic.set(ATTIC_KEY_WEBHOOKS, hooks);
  }

  server.getExpressApp().use(handleRequest);
};

module.exports = {
  ATTIC_KEY_WEBHOOKS,
  WEBHOOK_SCHEMA,
  setup,
};
