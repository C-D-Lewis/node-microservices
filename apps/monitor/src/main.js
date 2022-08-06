const { conduit, log } = require('./node-common')(['config', 'conduit', 'log']);
const plugins = require('./modules/plugins');

/**
 * The main function.
 */
const main = async () => {
  log.begin();

  await conduit.register();
  await conduit.send({
    to: 'visuals',
    topic: 'setAll',
    message: { all: [0, 0, 0] },
  });

  plugins.loadAll();
};

main();
