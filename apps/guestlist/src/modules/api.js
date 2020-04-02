const { conduit } = require('../node-common')(['conduit']);

/** Schema for messages to create users */
const CREATE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['name', 'password', 'apps', 'topics'],
  properties: {
    name: { type: 'string' },
    password: { type: 'string' },
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

/** Schema for messages to get a user */
const GET_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['name'],
  properties: {
    name: { type: 'string' },
  },
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('create', require('../api/create'), CREATE_MESSAGE_SCHEMA);
  conduit.on('get', require('../api/get'), GET_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
