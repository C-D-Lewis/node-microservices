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
const sendToAttic = async (json) => {
  const appConfig = allocator.findByApp('attic');
  const data = await requestAsync({
    url: `http://localhost:${appConfig.port}/conduit`,
    method: 'post',
    json
  });

  return data.body;
};

const recordPacket = async ({ to, topic, from }) => {
  if(!config.OPTIONS.RECORD_STATS) return;

  let response = await sendToAttic({
    to: 'attic', topic: 'get', message: { app: 'conduit', key: 'stats' }
  });

  // No stats yet
  if(response.error && response.status === 404) {
    const value = { to: {}, from: {}, topic: {}, all: 0 };
    response = { message: { value } };
  }

  const update = Object.assign({}, response.message.value);

  if(!update.to[to]) update.to[to] = 0;
  if(!update.from[from]) update.from[from] = 0; 
  if(!update.topic[topic]) update.topic[topic] = 0;
  if(!update.all) update.all = 0;

  update.topic[topic]++;
  update.from[from]++;
  update.to[to]++;
  update.all++;

  await sendToAttic({
    to: 'attic', topic: 'set', 
    message: { app: 'conduit', key: 'stats', value: update }
  });
};

module.exports = { recordPacket };
