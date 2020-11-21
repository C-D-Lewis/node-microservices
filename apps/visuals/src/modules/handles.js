let handles = {
  // demo: setIntervalRetVal
};

module.exports = {
  add: (name, val) => {
    handles[name] = val;
  },
  get: (name) => handles[name],
  remove: (name) => {
    clearInterval(handles[name]);
    handles[name] = null;
  },
  removeAll: () => {
    Object.entries(handles)
      .forEach(([, handle]) => clearInterval(handle));

    handles = {};
  },
};
