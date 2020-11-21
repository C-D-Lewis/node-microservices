const { MongoClient } = require('mongodb');
const { log } = require('../node-common')(['log']);

/** mongod URL */
const DB_URL = 'mongodb://localhost:27017';
/** MongoDB name */
const DB_NAME = 'AtticAppData';
/** MongoDB collection name */
const COLLECTION_NAME = 'AppDataDocument';

const client = new MongoClient(DB_URL);
let db;

/**
 * Initialise MongoDB connection
 */
const init = async () => {
  await client.connect();
  db = client.db(DB_NAME);

  log.debug('Connected to mongodb');
};

/**
 * Get a value by key.
 *
 * @param {string} key - The key.
 * @returns {*} The value.
 */
const get = async (key) => {
  const res = await db.collection(COLLECTION_NAME).findOne({ key });
  log.debug(`mongodb get ${JSON.stringify(res)}`);

  return res ? res.value : res;
};

/**
 * Check a key exists.
 *
 * @param {string} key - The key.
 * @returns {boolean} true if the key exists.
 */
const exists = async (key) => get(key) !== null;

/**
 * Set a value with key and value. Created if does not exist.
 *
 * @param {string} key - The key.
 * @param {string} value - The value.
 */
const set = async (key, value) => {
  const res = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true },
  );
  log.debug(`mongodb set ${JSON.stringify(res)}`);
};

module.exports = {
  init,
  exists,
  get,
  set,
};
