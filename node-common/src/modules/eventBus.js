const topics = {};

/**
 * Subscribe to event topic.
 *
 * @param {string} name - Topic name.
 * @param {function} cb - Callback when a matching event is broadcast.
 */
const subscribe = (name, cb) => {
  if (!topics[name]) {
    topics[name] = [];
  }

  topics[name].push(cb);
};

/**
 * Unsubscribe from a topic.
 *
 * @param {string} name - Topic name.
 * @param {function} cb - Callback when a matching event is broadcast.
 */
const unsubscribe = (name, cb) => {
  // Already unsubscribed or never was
  if (!topics[name]) return;

  topics[name].splice(topics[name].indexOf(cb), 1);
};

/**
 * Broadcast event on a topic name.
 *
 * @param {string} name - Topic name.
 * @param {object} params - Event extra data.
 */
const broadcast = (name, params) => {
  // Topic not used
  if (!topics[name]) return;

  topics[name].forEach(cb => cb(params));
};

module.exports = {
  subscribe,
  unsubscribe,
  broadcast,
};
