const { log } = require('../node-common')(['log']);
const { MongoClient } = require('mongodb');

/** mongod URL **/
const MONGO_DB_URL = 'mongodb://localhost:27017';
/** MongoDB name **/
const MONGO_DB_NAME = 'AtticAppData';
/** MongoDB collection name **/
const MONGO_DB_COLLECTION_NAME = 'AppDataDocument';

let client = new MongoClient(MONGO_DB_URL);
let db;

/**
 * Initialise
 */
const init = async () => {
  await client.connect();
  db = client.db(MONGO_DB_NAME);

  log.debug('Connected to mongodb');
};

/**
 * Get a value by key.
 *
 * @param {string} key - The key.
 * @returns {*} The value.
 */
 const get = async (key) => {
  const res = await db.collection(MONGO_DB_COLLECTION_NAME).findOne({ key });
  log.debug({ res });

  return res ? res.value : res;
};

/**
 * Check a key exists.
 *
 * @param {string} key - The key.
 * @returns {boolean} true if the key exists.
 */
const exists = async key => get(key) !== null;

/**
 * Set a value with key and value.
 *
 * @param {string} key - The key.
 * @param {string} value - The value.
 */
const set = async (key, value) => {
  const res = await db.collection(MONGO_DB_COLLECTION_NAME).findOneAndUpdate(
    { key },
    { $set: { value } },
    { upsert: true },
  );
  log.debug({ res });
};

module.exports = {
  init,
  exists,
  get,
  set,
};
