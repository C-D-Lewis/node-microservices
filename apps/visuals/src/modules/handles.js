const { log } = require('../node-common')(['log']);

let handles = {
  // demo: setIntervalRetVal
};

module.exports = {
  add: (name, val) => {
    // If it's already started, ignore
    if (handles[name]) {
      log.warn(`Handle ${name} already started, ignoring`);
      return;
    }

    handles[name] = val;
  },
  get: (name) => handles[name],
  getAll: () => handles,
  cancelAll: () => {
    Object.entries(handles)
      .forEach(([, handle]) => clearInterval(handle));

    handles = {};
  },
};
