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

// Model - always query DB for latest list, since Express doesn't support route removal
const registerForWebhooks = async () => {
  const app = server.getExpressApp();

  // When any request comes in...
  app.use(async (req, res) => {
    const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
    if (!hooks.length) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    const urlRequested = req.path;
    const found = hooks.find(p => p.url === urlRequested)
    if (!found) {
      log.error(`Webhook does not exist for URL ${urlRequested}`);
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    // Add some extra metadata
    found.packet.message = found.packet.message || {};
    found.packet.message.webhookQuery = req.query;

    // Store data
    log.info(`Forwarding webhook to ${found.packet.to}`);
    await conduit.send(found.packet);
    server.respondOk(res);
  });
};

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

  registerForWebhooks();
};

module.exports = { setup, ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA };
