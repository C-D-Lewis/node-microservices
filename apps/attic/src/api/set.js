const { log, conduit } = require('../node-common')(['log', 'conduit']);
const storage = require('../modules/storage');

module.exports = async ({ message }, res) => {
  const { app, key, value } = message;
  const appData = await storage.get(app) || {};

  appData[key] = { value, timestamp: new Date().getTime() };
  await storage.set(app, appData);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
