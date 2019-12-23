const { conduit } = require('../node-common')(['conduit']);
const { WEBHOOK_SCHEMA } = require('./webhooks');

/**
 * Register Conduit topic handlers.
 */
const setup = () => {
  conduit.on('add', require('../api/add'), WEBHOOK_SCHEMA);
  conduit.on('remove', require('../api/remove'), WEBHOOK_SCHEMA);
};

module.exports = {
  setup,
};
