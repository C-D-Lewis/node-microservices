const fs = require('fs');
const config = require('./config');
const log = require('./log');

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

let table;

const loadTable = () => {
  if (table) {
    return;
  }

  if (!fs.existsSync(DB_PATH)) {
    table = {};
    saveTable();
  }

  table = require(DB_PATH);
};

const saveTable = () => fs.writeFileSync(DB_PATH, JSON.stringify(table, null, 2), 'utf8');

const get = (key) => {
  loadTable();
  return table[key];
};

const set = (key, value) => {
  loadTable();
  table[key] = value;
  saveTable();
};

const getTable = () => {
  loadTable();
  return table;
};

const _delete = (key) => {
  loadTable();
  delete table[key];
  saveTable();
};

module.exports = {
  get,
  set,
  getTable,
  exists: key => get(key) !== undefined,
  delete: _delete,
};
