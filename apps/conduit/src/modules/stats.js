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

  let current = await atticSend({
    to: 'attic', topic: 'get', message: { app: 'conduit', key: 'stats' },
  });

  // No stats yet
  if (current.error && current.status === 404) {
    const initialState = { recipients: {}, senders: {}, topics: {}, total: 0 };
    current = {
      message: { value: initialState },
    };
  }

  // Compile the data update for Attic (can be initial state)
  const update = Object.assign({}, current.message.value);
  update.recipients[to] = update.recipients[to] || 0;
  update.senders[from] = update.senders[from] || 0;
  update.topics[topic] = update.topics[topic] || 0;
  update.total = update.total || 0;

  // Update the state
  update.recipients[to]++;
  update.senders[from]++;
  update.topics[topic]++;
  update.total++;

  await atticSend({
    to: 'attic',
    topic: 'set',
    message: { app: 'conduit', key: 'stats', value: update },
  });
};

module.exports = {
  recordPacket,
};
