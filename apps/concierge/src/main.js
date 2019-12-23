const {
  attic, config, conduit, log,
} = require('./node-common')(['attic', 'config', 'conduit', 'log']);
const api = require('./modules/api');
const { handlePacketWebhook } = require('./api/add');
const { ATTIC_KEY_WEBHOOKS, setupHandler } = require('./modules/webhooks');

config.requireKeys('main.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['ENSURED_WEBHOOKS'],
      properties: {
        ENSURED_WEBHOOKS: { type: 'array', items: { type: 'object' } },
      },
    },
  },
});

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  try {
    await conduit.register();
    await conduit.send({ to: 'attic', topic: 'status' });
  } catch(e) {
    log.error(e);
    log.fatal('Unable to reach attic!');
  }

  // Intialise app-wide data
  try {
    // Throws if app not yet found
    const existing = await attic.get(ATTIC_KEY_WEBHOOKS);
    if (existing.length) {
      log.info('Known webhooks:');
      existing.forEach(p => log.info(`  POST ${p.url}`));
    }
  } catch (e) {
    log.info('Initialising empty list of webhooks');
    await attic.set(ATTIC_KEY_WEBHOOKS, []);
  }

  // Place any webhooks that are missing
  const { ENSURED_WEBHOOKS } = config.OPTIONS;
  const existing = await attic.get(ATTIC_KEY_WEBHOOKS);
  for (let i = 0; i < ENSURED_WEBHOOKS.length; i += 1) {
    const hook = ENSURED_WEBHOOKS[i];
    if (!existing.find(p => p.url === hook.url)) {
      await handlePacketWebhook(hook);
      log.info(`Ensured missing hook ${JSON.stringify(hook)}`);
    }
  }

  setupHandler();
  api.setup();
};

main();
