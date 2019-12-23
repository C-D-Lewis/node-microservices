const { conduit } = require('../node-common')(['conduit']);

/** Schema for a setAll packet */
const SET_ALL_PACKET_SCHEMA = {
  additionalProperties: false,
  required: ['all'],
  properties: {
    all: { type: 'array', items: { type: 'integer' } },
  },
};

/** Schema for a packet with indexed data fields */
const INDEXED_PACKET_SCHEMA = {
  additionalProperties: false,
  patternProperties: {
    '[0-9]{1}': { type: 'array', items: { type: 'integer' } },
  },
};

/** Schema for a packet used to set text display content */
const SET_TEXT_PACKET_SCHEMA = {
  additionalProperties: false,
  required: ['lines'],
  properties: {
    lines: { type: 'array', items: { type: 'string' } },
  },
};

/** Schema for an empty packet */
const EMPTY_PACKET_SCHEMA = { type: 'object' };

/**
 * Register with conduit and setup packet topic handlers.
 */
const setup = async () => {
  await conduit.register();

  conduit.on('setAll', require('../api/setAll'), SET_ALL_PACKET_SCHEMA);
  conduit.on('setPixel', require('../api/setPixel'), INDEXED_PACKET_SCHEMA);
  conduit.on('blink', require('../api/blink'), INDEXED_PACKET_SCHEMA);
  conduit.on('setText', require('../api/setText'), SET_TEXT_PACKET_SCHEMA);
  conduit.on('state', require('../api/state'), EMPTY_PACKET_SCHEMA);
};

module.exports = {
  setup,
};
