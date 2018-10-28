const bodyParser = require('body-parser');

const {
  attic, conduit, config, log, server
} = require('@chris-lewis/node-common')(['attic', 'conduit', 'config', 'log', 'server']);

const ATTIC_KEY_WEBHOOKS = 'webhooks';
const WEBHOOK_SCHEMA = {
  additionalProperties: false,
  required: [ 'url', 'packet' ],
  type: 'object', properties: {
    url: { type: 'string' },
    packet: {
      additionalProperties: false,
      required: [ 'to', 'topic' ],
      type: 'object', properties: {
        to: { type: 'string' },
        topic: { type: 'string' }
      }
    }
  }
};

let app;

// Model - always query DB for latest list, since Express doesn't support route removal
const registerForWebhooks = async () => {
  app.use(async (req, res) => {
    const webhooks = await attic.get(ATTIC_KEY_WEBHOOKS);
    if(!webhooks.length) {
      res.status(404);
      res.send('Not Found');
      return;
    }

    const urlRequested = req.path;
    const found = webhooks.find(item => item.url === urlRequested)
    if(!found) {
      log.error(`Webhook does not exist for URL ${urlRequested}`);
      res.status(404);
      res.send('Not Found');
      return;
    }

    // Add some extra metadata
    if(!found.packet.message) found.packet.message = {};
    found.packet.message.webhookQuery = req.query;

    log.info(`Forwarding webhook to ${found.packet.to}`);
    await conduit.send(found.packet);
    server.respondOk(res);
  });
};

const setup = async () => {
  server.start();

  try {
    const webhooks = await attic.get(ATTIC_KEY_WEBHOOKS);
    log.info('Known webhooks:');
    webhooks.forEach(hook => log.info(`POST ${hook.url}`));
  } catch (e) {
    webhooks = [];
    await attic.set(ATTIC_KEY_WEBHOOKS, webhooks);
  }

  app = server.getExpressApp();
  registerForWebhooks();
};

module.exports = { setup, ATTIC_KEY_WEBHOOKS, WEBHOOK_SCHEMA };
