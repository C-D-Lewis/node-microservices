const { config, log, requestAsync } = require('../node-common')(['config', 'log', 'requestAsync']);
const allocator = require('./allocator');

config.requireKeys('stats.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['RECORD_STATS'],
      properties: {
        RECORD_STATS: { type: 'boolean' },
      },
    },
  },
});

// Can't use conduit.js - not a Conduit app!
const atticSend = async (json) => {
  const { body } = await requestAsync({
    url: `http://localhost:${allocator.findByApp('attic').port}/conduit`,
    method: 'post',
    json,
  });

  return body;
};

const recordPacket = async ({ to, topic, from }) => {
  if (!config.OPTIONS.RECORD_STATS) {
    return;
  }

  let response = await atticSend({
    to: 'attic', topic: 'get', message: { app: 'conduit', key: 'stats' },
  });

  // No stats yet
  if (response.error && response.status === 404) {
    const initialState = { to: {}, from: {}, topic: {}, all: 0 };
    response = {
      message: { value: initialState },
    };
  }

  // Compile the data update for Attic (can be initial state)
  const update = Object.assign({}, response.message.value);
  update.to[to] = update.to[to] || 0;
  update.from[from] = update.from[from] || 0;
  update.topic[topic] = update.topic[topic] || 0;
  update.all = update.all || 0;

  // Update the state
  update.topic[topic]++;
  update.from[from]++;
  update.to[to]++;
  update.all++;

  await atticSend({
    to: 'attic',
    topic: 'set',
    message: { app: 'conduit', key: 'stats', value: update },
  });
};

module.exports = {
  recordPacket,
};
