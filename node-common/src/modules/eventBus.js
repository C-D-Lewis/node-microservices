const bus = {};

const subscribe = (name, cb) => {
  if (!bus[name]) {
    bus[name] = [];
  }

  bus[name].push(cb);
};

const unsubscribe = (name, cb) => {
  if (!bus[name]) {
    return;
  }

  bus[name].splice(bus[name].indexOf(cb), 1);
};

const broadcast = (name, params) => {
  if (!bus[name]) {
    return;
  }

  bus[name].forEach(cb => cb(params));
};

module.exports = {
  subscribe,
  unsubscribe,
  broadcast,
};
