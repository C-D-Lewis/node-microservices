const {
  attic, bifrost, log, server,
} = require('../node-common')(['attic', 'bifrost', 'log', 'server']);

/** Attic key for webhook list */
const ATTIC_KEY_WEBHOOKS = 'webhooks';
/** Schema for a webhook */
const WEBHOOK_SCHEMA = {
  additionalProperties: false,
  required: ['url'],
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
  // If no hooks, nothing to do
  const hooks = await attic.get(ATTIC_KEY_WEBHOOKS);
  if (!hooks.length) {
    res.status(404).json({ error: 'No hooks exist yet' });
    return;
  }

  // Check there is a hook for this URL
  const { path, query } = req;
  const found = hooks.find((p) => p.url === path);
  if (!found) {
    log.error(`Webhook does not exist for URL ${path}`);
    res.status(404).json({ error: 'No hook found' });
    return;
  }

  // Handle the hook call
  const { url, packet } = found;
  if (packet) {
    // TODO: Add a test for this
    // Forward the packet's static message and the webhook query to trigger another service
    packet.message = packet.message || {};
    packet.message.webhookQuery = query;
    packet.id = bifrost.generateId();

    log.info(`Forwarding webhook to ${packet.to}`);
    await bifrost.send(packet);
  } else {
    // Just save the query in local Attic for use asynchronously
    await attic.set(url, query);
    log.info(`Saved query ${JSON.stringify(query)} to attic key ${url}`);
  }

  server.respondOk(res);
};

/**
 * Set up routes for hooks read from DB.
 */
const setupHandler = async () => {
  server.start();

  server.getExpressApp().use(handleRequest);
};

module.exports = {
  ATTIC_KEY_WEBHOOKS,
  WEBHOOK_SCHEMA,
  setupHandler,
};
