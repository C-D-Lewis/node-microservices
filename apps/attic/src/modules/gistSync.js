const { log, gistSync } = require('../node-common')(['log', 'gistSync']);

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

module.exports = {
  init: gistSync.init,
  /**
   * Check an app has data.
   *
   * @param {string} app - App name.
   * @returns {boolean} true if the app has data stored.
   */
  exists: (app) => loadGistSyncFile()[app] !== null,
  /**
   * Get data for a given app.
   *
   * @param {string} app - App name.
   * @returns {object} App data stored.
   */
  get: (app) => loadGistSyncFile()[app],
  /**
   * Set data for a given app.
   *
   * @param {string} app - App name.
   * @param {object} appData - App data to store.
   */
  set: (app, appData) => {
    const data = loadGistSyncFile();
    if (!data) return;

    data[app] = appData;
  },
  /**
   * Get all app names that have data stored.
   *
   * @returns {Array<string>} List of app names.
   */
  getAppNames: () => {
    const data = loadGistSyncFile() || {};
    return Object.keys(data);
  },
};
