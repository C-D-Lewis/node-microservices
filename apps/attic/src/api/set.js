const { log, conduit } = require('../node-common')(['log', 'conduit']);
const storage = require('../modules/storage');

module.exports = ({ message }, res) => {
  const { app, key, value } = message;
  const appData = storage.get(app) || {};

  appData[key] = { value, timestamp: new Date().getTime() };
  storage.set(app, appData);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
