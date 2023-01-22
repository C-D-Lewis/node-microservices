const { bifrost } = require('../node-common')(['bifrost']);
const { WEBHOOK_SCHEMA } = require('./webhooks');

/**
 * Register Conduit topic handlers.
 */
const setup = () => {
  bifrost.registerTopic('add', require('../api/add').handleAddPacket, WEBHOOK_SCHEMA);
  bifrost.registerTopic('remove', require('../api/remove'), WEBHOOK_SCHEMA);
};

module.exports = { setup };
