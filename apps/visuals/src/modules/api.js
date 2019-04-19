const { conduit } = require('../node-common')(['conduit']);

const SET_ALL_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['all'],
  properties: {
    all: { type: 'array', items: { type: 'integer' } },
  },
};

const INDEXED_MESSAGE_SCHEMA = {
  additionalProperties: false,
  patternProperties: {
    '[0-9]{1}': { type: 'array', items: { type: 'integer' } },
  },
};

const SET_TEXT_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: ['lines'],
  properties: {
    lines: { type: 'array', items: { type: 'string' } },
  },
};

const EMPTY_MESSAGE_SCHEMA = { type: 'object' };

const setup = async () => {
  await conduit.register();

  conduit.on('setAll', require('../api/setAll'), SET_ALL_MESSAGE_SCHEMA);
  conduit.on('setPixel', require('../api/setPixel'), INDEXED_MESSAGE_SCHEMA);
  conduit.on('blink', require('../api/blink'), INDEXED_MESSAGE_SCHEMA);
  conduit.on('setText', require('../api/setText'), SET_TEXT_MESSAGE_SCHEMA);
  conduit.on('state', require('../api/state'), EMPTY_MESSAGE_SCHEMA);
};

module.exports = {
  setup,
};
