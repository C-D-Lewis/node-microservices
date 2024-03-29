const fs = require('fs');
const config = require('./config');
const log = require('./log');

config.addPartialSchema({
  required: ['DB'],
  properties: {
    DB: {
      required: ['FILE'],
      properties: {
        FILE: { type: 'string' },
      },
    },
  },
});

const { DB } = config.get(['DB']);

/** Path to DB file */
const DB_PATH = `${config.getInstallPath()}/${DB.FILE}`;

let dbData;

/**
 * Save the DB data to file.
 *
 * @returns {void}
 */
const saveDbData = () => fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');

/**
 * Load the DB file data.
 */
const loadDbData = () => {
  if (dbData) return;

  if (!fs.existsSync(DB_PATH)) {
    dbData = {};
    saveDbData();
  }

  // Verify valid JSON is in the file, else die
  try {
    dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (e) {
    log.fatal('Failed to read valid JSON from db.json');
  }
};

/**
 * Get app data by app.
 *
 * @param {string} app - App name to use.
 * @returns {*} Saved app data.
 */
const get = (app) => {
  loadDbData();
  return dbData[app];
};

/**
 * Set app data.
 *
 * @param {string} app - App name to use.
 * @param {*} appData - Value to set.
 */
const set = (app, appData) => {
  loadDbData();
  dbData[app] = appData;
  saveDbData();
};

/**
 * Get the entire file.
 *
 * @returns {object} Entire data file.
 */
const getTable = () => {
  loadDbData();
  return dbData;
};

/**
 * Delete app data by app name.
 *
 * @param {string} app - App name to use.
 */
const deleteAppData = (app) => {
  loadDbData();
  delete dbData[app];
  saveDbData();
};

/**
 * Upon db storage start.
 */
const init = () => {
  loadDbData();
};

module.exports = {
  init,
  get,
  set,
  getTable,
  /**
   * Check a value exists by key.
   *
   * @param {string} app - App name to use.
   * @returns {boolean} true if the value exists.
   */
  exists: (app) => get(app) !== undefined,
  delete: deleteAppData,
  /**
   * Get all app names storing data.
   *
   * @returns {Array<string>} List of app names.
   */
  getAppNames: () => Object.keys(getTable()),
};
