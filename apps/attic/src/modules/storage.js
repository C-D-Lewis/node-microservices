const {
  config, db, gistSync, log,
} = require('../node-common')(['config', 'db', 'gistSync', 'log']);

config.requireKeys('storage.js', {
  required: ['STORAGE_MODE'],
  properties: {
    STORAGE_MODE: {
      type: 'string',
      enum: ['db', 'gistSync'],
    },
  },
});

const { STORAGE_MODE } = config;

const loadGistSyncFile = () => {
  const data = gistSync.getFile('attic-db.json');
  if (!data) {
    log.error('Could get load gistSync file!');
    return;
  }

  return data;
};

const MODE_HANDLERS = {
  db: {
    init: () => {},
    exists: db.exists,
    get: db.get,
    set: db.set,
  },
  gistSync: {
    init: gistSync.init,
    exists: key => loadGistSyncFile()[key] !== null,
    get: key => loadGistSyncFile()[key],
    set: (key, value) => {
      const data = loadGistSyncFile();
      if (!data) {
        return;
      }

      data[key] = value;
    },
  },
};

module.exports = {
  get: key => MODE_HANDLERS[STORAGE_MODE].get(key),
  set: (key, value) => MODE_HANDLERS[STORAGE_MODE].set(key, value),
  exists: key => MODE_HANDLERS[STORAGE_MODE].exists(key),
  init: () => MODE_HANDLERS[STORAGE_MODE].init(),
};
