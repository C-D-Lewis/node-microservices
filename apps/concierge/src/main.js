const { conduit, log } = require('./node-common')(['conduit', 'log']);
const api = require('./modules/api');
const webhooks = require('./modules/webhooks');

const main = async () => {
  log.begin();

  try {
    await conduit.register();
    await conduit.send({ to: 'attic', topic: 'status' });
  } catch(e) {
    log.fatal('Unable to reach attic!');
  }

  webhooks.setup();
  api.setup();
};

main();
