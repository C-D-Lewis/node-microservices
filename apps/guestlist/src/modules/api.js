const { bifrost } = require('../node-common')(['bifrost']);

/** Schema for messages to create users */
const CREATE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['name', 'apps', 'topics', 'adminPassword'],
  properties: {
    name: { type: 'string' },
    apps: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    topics: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    adminPassword: { type: 'string' },
  },
};

/** Schema for messages to delete a user */
const DELETE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['name', 'adminPassword'],
  properties: {
    name: { type: 'string' },
    adminPassword: { type: 'string' },
  },
};

/** Schema for messages to get a user */
const AUTHORIZE_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['to', 'topic', 'token'],
  properties: {
    to: { type: 'string' },
    topic: { type: 'string' },
    token: { type: 'string' },
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

/** Schema for messages to get all users, minus tokens */
const GET_ALL_MESSAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
};

/**
 * Setup Conduit topic handlers.
 */
const setup = async () => {
  await bifrost.connect();

  bifrost.registerTopic('create', require('../api/create'), CREATE_MESSAGE_SCHEMA);
  bifrost.registerTopic('get', require('../api/get'), GET_MESSAGE_SCHEMA);
  bifrost.registerTopic('getAll', require('../api/getAll'), GET_ALL_MESSAGE_SCHEMA);
  bifrost.registerTopic('authorize', require('../api/authorize'), AUTHORIZE_MESSAGE_SCHEMA);
  bifrost.registerTopic('delete', require('../api/delete'), DELETE_MESSAGE_SCHEMA);
};

module.exports = { setup };
