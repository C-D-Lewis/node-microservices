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
 * Show the stored webhooks, or initialise if missing.
 */
const initWebhooks = async () => {
  try {
    // Throws if app not yet found
    const existing = await attic.get(ATTIC_KEY_WEBHOOKS);
    if (existing.length) {
      log.info('Known webhooks:');
      existing.forEach((p) => log.info(`  POST ${p.url}`));
    }
  } catch (e) {
    log.info('Initialising empty list of webhooks');
    await attic.set(ATTIC_KEY_WEBHOOKS, []);
  }
};

/**
 * Add any missing ensured webhooks (required).
 */
const initEnsuredWebhooks = async () => {
  const { ENSURED_WEBHOOKS } = config.OPTIONS;
  const existing = await attic.get(ATTIC_KEY_WEBHOOKS);
  for (let i = 0; i < ENSURED_WEBHOOKS.length; i += 1) {
    const hook = ENSURED_WEBHOOKS[i];

    // If it's missing, store it
    if (!existing.find((p) => p.url === hook.url)) {
      await handlePacketWebhook(hook);
      log.info(`Ensured missing hook ${JSON.stringify(hook)}`);
    }
  }
};

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  try {
    await conduit.register();
    await conduit.send({ to: 'attic', topic: 'status' });
  } catch (e) {
    log.error(e);
    log.fatal('Unable to reach attic!');
  }

  await initWebhooks();
  await initEnsuredWebhooks();

  setupHandler();
  api.setup();
};

main();
