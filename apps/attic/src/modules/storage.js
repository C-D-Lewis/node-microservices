const {
  config, db,
} = require('../node-common')(['config', 'db']);
const mongo = require('./mongo');
const gistSync = require('./gistSync');

const { STORAGE_MODE } = config.withSchema('storage.js', {
  required: ['STORAGE_MODE'],
  properties: {
    STORAGE_MODE: {
      type: 'string',
      enum: ['db', 'gistSync', 'mongo'],
    },
  },
});

/** Implementation of each storage mode using same interface */
const MODE_HANDLERS = {
  db,
  mongo,
  gistSync,
};

module.exports = {
  /**
   * Check an app has data.
   *
   * @param {string} app - App name.
   * @returns {boolean} true if the app has data stored.
   */
  exists: (app) => MODE_HANDLERS[STORAGE_MODE].exists(app),
  /**
   * Get data for a given app.
   *
   * @param {string} app - App name.
   * @returns {object} App data stored.
   */
  get: (app) => MODE_HANDLERS[STORAGE_MODE].get(app),
  /**
   * Set data for a given app.
   *
   * @param {string} app - App name.
   * @param {object} appData - App data to store.
   * @returns {void}
   */
  set: (app, appData) => MODE_HANDLERS[STORAGE_MODE].set(app, appData),
  /**
   * Initialise the data store.
   *
   * @returns {void}
   */
  init: () => MODE_HANDLERS[STORAGE_MODE].init(),
  /**
   * Get all app names that have data stored.
   *
   * @returns {Array<string>} List of app names.
   */
  getAppNames: () => MODE_HANDLERS[STORAGE_MODE].getAppNames(),
};
