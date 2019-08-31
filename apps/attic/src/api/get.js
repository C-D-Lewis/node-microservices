const { log, conduit } = require('../node-common')(['log', 'conduit']);
const storage = require('../modules/storage');

module.exports = async ({ message }, res) => {
  const { app, key } = message;
  const appData = await storage.get(app);
  if(!appData || !appData[key]) {
    conduit.respond(res, { status: 404, error: `app ${app} or key ${key} not found` });
    return;
  }

  const { value, timestamp } = appData[key];
  conduit.respond(res, { status: 200, message: { app, key, value, timestamp } });
};
