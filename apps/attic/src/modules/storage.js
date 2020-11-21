const {
  config, db, gistSync, log,
} = require('../node-common')(['config', 'db', 'gistSync', 'log']);
const mongo = require('./mongo');

config.requireKeys('storage.js', {
  required: ['STORAGE_MODE'],
  properties: {
    STORAGE_MODE: {
      type: 'string',
      enum: ['db', 'gistSync', 'mongo'],
    },
  },
});

const {
  /** The selected storage mode. */
  STORAGE_MODE,
} = config;

/**
 * Load the gistSync file.
 */
const loadGistSyncFile = () => {
  const data = gistSync.getFile('attic-db.json');
  if (!data) {
    log.error('Could get load gistSync file!');
    return undefined;
  }

  return data;
};

/** Implementation of each storage mode using same interface */
const MODE_HANDLERS = {
  db,
  mongo,
  gistSync: {
    init: gistSync.init,
    exists: (key) => loadGistSyncFile()[key] !== null,
    get: (key) => loadGistSyncFile()[key],
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
  get: (key) => MODE_HANDLERS[STORAGE_MODE].get(key),
  set: (key, value) => MODE_HANDLERS[STORAGE_MODE].set(key, value),
  exists: (key) => MODE_HANDLERS[STORAGE_MODE].exists(key),
  init: () => MODE_HANDLERS[STORAGE_MODE].init(),
};
