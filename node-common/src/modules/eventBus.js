const topics = {};

const subscribe = (name, cb) => {
  if (!topics[name]) {
    topics[name] = [];
  }

  topics[name].push(cb);
};

const unsubscribe = (name, cb) => {
  if (!topics[name]) {
    return;
  }

  topics[name].splice(topics[name].indexOf(cb), 1);
};

const broadcast = (name, params) => {
  if (!topics[name]) {
    return;
  }

  topics[name].forEach(cb => cb(params));
};

module.exports = {
  subscribe,
  unsubscribe,
  broadcast,
};
