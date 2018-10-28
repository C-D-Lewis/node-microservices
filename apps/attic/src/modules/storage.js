const {
  config, db, gistSync, log
} = require('@chris-lewis/node-common')(['config', 'db', 'gistSync', 'log']);

config.requireKeys('storage.js', {
  required: [ 'STORAGE_MODE' ],
  type: 'object', properties: {
    STORAGE_MODE: { type: 'string', enum: [ 'db', 'gistSync' ] }
  }
});

const MODE = config.STORAGE_MODE;

const loadGistSyncFile = () => {
  const data = gistSync.getFile('attic-db.json');
  if(!data) {
    log.error('Could get load gistSync file!');
    return null;
  }

  return data;
};

const MODE_HANDLERS = {
  db: {
    get: db.get,
    set: db.set,
    exists: db.exists,
    init: () => {}
  },
  gistSync: {
    get: (key) => {
      const data = loadGistSyncFile();
      if(!data) return;

      return data[key];
    },
    set: (key, value) => {
      const data = loadGistSyncFile();
      if(!data) return;

      data[key] = value;
    },
    exists: (key) => {
      const data = loadGistSyncFile();
      if(!data) return;

      return data[key] != null;
    },
    init: () => {
      gistSync.init();
    }
  }
};

module.exports = { 
  get: key => MODE_HANDLERS[MODE].get(key),
  set: (key, value) => MODE_HANDLERS[MODE].set(key, value),
  exists: key => MODE_HANDLERS[MODE].exists(key),
  init: () => MODE_HANDLERS[MODE].init()
};
