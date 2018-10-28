const {
  conduit, log
} = require('@chris-lewis/node-common')(['conduit', 'log']);

const api = require('./modules/api');
const webhooks = require('./modules/webhooks');

(async () => {
  log.begin();

  try {
    await conduit.register();
    await conduit.send({ to: 'Attic', topic: 'status' });
  } catch(e) {
    log.fatal('Unable to reach Attic!');
  }

  webhooks.setup();
  api.setup();
})();