const bus = {};

const subscribe = (name, callback) => {
  if(!bus[name]) bus[name] = [];
  bus[name].push(callback);
};

const unsubscribe = (name, callback) => {
  if(!bus[name]) return;
  bus[name].splice(bus[name].indexOf(callback), 1);
};

const broadcast = (name, params) => {
  if(!bus[name]) return;
  bus[name].forEach(callback => callback(params));
};

module.exports = { subscribe, unsubscribe, broadcast };
