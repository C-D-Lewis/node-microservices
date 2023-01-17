const { bifrost } = require('../node-common')(['bifrost']);

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

/** Schema for a fromAll packet - from is optional, else using current state of LEDs */
const FADE_ALL_TO_PACKET_SCHEMA = {
  additionalProperties: false,
  required: ['to'],
  properties: {
    from: { type: 'array', items: { type: 'integer' } },
    to: { type: 'array', items: { type: 'integer' } },
  },
};

/** Schema for an empty packet */
const EMPTY_PACKET_SCHEMA = { type: 'object' };

/**
 * Register with bifrost and setup packet topic handlers.
 */
const setup = async () => {
  await bifrost.connect();

  bifrost.registerTopic('setAll', require('../api/setAll'), SET_ALL_PACKET_SCHEMA);
  bifrost.registerTopic('setPixel', require('../api/setPixel'), INDEXED_PACKET_SCHEMA);
  bifrost.registerTopic('blink', require('../api/blink'), INDEXED_PACKET_SCHEMA);
  bifrost.registerTopic('setText', require('../api/setText'), SET_TEXT_PACKET_SCHEMA);
  bifrost.registerTopic('state', require('../api/state'), EMPTY_PACKET_SCHEMA);
  bifrost.registerTopic('fadeAll', require('../api/fadeAll'), FADE_ALL_TO_PACKET_SCHEMA);
  bifrost.registerTopic('off', require('../api/off'), EMPTY_PACKET_SCHEMA);
  bifrost.registerTopic('demo', require('../api/demo'), EMPTY_PACKET_SCHEMA);
  bifrost.registerTopic('spotify', require('../api/spotify'), EMPTY_PACKET_SCHEMA);
};

module.exports = { setup };
