const { log } = require('../node-common')(['log']);
const { MongoClient } = require('mongodb');

const MONGO_DB_URL = 'mongodb://localhost:27017';
const MONGO_DB_NAME = 'AtticAppData';
const MONGO_DB_COLLECTION_NAME = 'AppDataDocument';

let client = new MongoClient(MONGO_DB_URL);
let db;

const init = async () => {
  await client.connect();
  db = client.db(MONGO_DB_NAME);

  log.debug('Connected to mongodb');
};

const get = async (key) => {
  const res = await db.collection(MONGO_DB_COLLECTION_NAME).findOne({ key });
  log.debug({ res });

  return res ? res.value : res;
};

const exists = async key => get(key) !== null;

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
