const {
  conduit, schema
} = require('@chris-lewis/node-common')(['conduit', 'schema']);

const SET_ALL_MESSAGE_SCHEMA = {
  additionalProperties: false,
  required: [ 'all' ],
  type: 'object', properties: {
    all: { type: 'array', items: { type: 'integer' } }
  }
};

const INDEXED_MESSAGE_SCHEMA = {
  additionalProperties: false,
  type: 'object', patternProperties: {
    '[0-9]{1}': { type: 'array', items: { type: 'integer' } }
  }
};

const setup = async () => {
  await conduit.register();

  conduit.on('setAll', require('../api/setAll'), SET_ALL_MESSAGE_SCHEMA);
  conduit.on('setPixel', require('../api/setPixel'), INDEXED_MESSAGE_SCHEMA);
  conduit.on('blink', require('../api/blink'), INDEXED_MESSAGE_SCHEMA);
};

module.exports = { setup };
