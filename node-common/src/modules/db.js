const fs = require('fs');
const config = require('./config');

config.requireKeys('db.js', {
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

/** Path to DB file */
const DB_PATH = `${config.getInstallPath()}/${config.DB.FILE}`;

let dbData;

/**
 * Load the DB file data.
 */
const loadDbData = () => {
  if (dbData) return;

  if (!fs.existsSync(DB_PATH)) {
    dbData = {};
    saveDbData();
  }

  dbData = require(DB_PATH);
};

/**
 * Save the DB data to file.
 */
const saveDbData = () => fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');

/**
 * Get a value by key.
 *
 * @param {string} key - Key to use.
 * @returns {*} Saved value.
 */
const get = (key) => {
  loadDbData();
  return dbData[key];
};

/**
 * Set a value.
 *
 * @param {string} key - Key to use.
 * @param {*} value - Value to set.
 */
const set = (key, value) => {
  loadDbData();
  dbData[key] = value;
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
 * Delete a value by key.
 *
 * @param {string} key - Key to use.
 */
const _delete = (key) => {
  loadDbData();
  delete dbData[key];
  saveDbData();
};

module.exports = {
  /**
   * Stub for the interface
   */
  init: () => {},  // Allows simplification in Attic storage.js, but no other apps implement it
  get,
  set,
  getTable,
  /**
   * Check a value exists by key.
   *
   * @param {string} key - Key to use.
   * @returns {boolean} true if the value exists.
   */
  exists: key => get(key) !== undefined,
  delete: _delete,
};
