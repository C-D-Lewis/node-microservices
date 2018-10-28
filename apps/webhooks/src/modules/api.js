const {
  conduit, schema
} = require('@chris-lewis/node-common')(['conduit', 'schema']);

const webhooks = require('./webhooks');

const setup = () => {
  conduit.on('add', require('../api/add'), webhooks.WEBHOOK_SCHEMA);
  conduit.on('remove', require('../api/remove'), webhooks.WEBHOOK_SCHEMA);
};

module.exports = { setup };
