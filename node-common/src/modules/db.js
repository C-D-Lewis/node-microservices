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

const DB_PATH = `${config.getInstallPath()}/${config.DB.FILE}`;

let dbData;

const loadDbData = () => {
  if (dbData) {
    return;
  }

  if (!fs.existsSync(DB_PATH)) {
    dbData = {};
    saveTable();
  }

  dbData = require(DB_PATH);
};

const saveTable = () => fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf8');

const get = (key) => {
  loadDbData();
  return dbData[key];
};

const set = (key, value) => {
  loadDbData();
  dbData[key] = value;
  saveTable();
};

const getTable = () => {
  loadDbData();
  return dbData;
};

const _delete = (key) => {
  loadDbData();
  delete dbData[key];
  saveTable();
};

module.exports = {
  get,
  set,
  getTable,
  exists: key => get(key) !== undefined,
  delete: _delete,
};
