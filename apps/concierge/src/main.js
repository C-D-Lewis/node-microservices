const { attic, conduit, log } = require('./node-common')(['attic', 'conduit', 'log']);
const api = require('./modules/api');
const { ATTIC_KEY_WEBHOOKS, setupHandler } = require('./modules/webhooks');

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

  setupHandler();
  api.setup();
};

main();
