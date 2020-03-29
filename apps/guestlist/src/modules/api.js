const { conduit } = require('../node-common')(['conduit']);

/** Schema for messages with no value */
const CREATE_MESSAGE_SCHEMA = {
  required: ['name', 'apps', 'topics'],
  properties: {
    name: { type: 'string' },
    apps: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
    topics: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1
    },
  },
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('create', require('../api/create'), CREATE_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
