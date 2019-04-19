const { log, conduit } = require('../node-common')(['log', 'conduit']);
const storage = require('../modules/storage');

module.exports = ({ message }, res) => {
  const { app, key } = message;
  const appData = storage.get(app);
  if(!appData || !appData[key]) {
    conduit.respond(res, { status: 404, error: `app ${app} or key ${key} not found` });
    return;
  }

  const { value } = appData[key];
  if(typeof value !== 'number') {
    conduit.respond(res, { status: 400, error: `value ${value} not a number, cannot increment` });
    return;
  }

  appData[key] = { timestamp: Date.now(), value: value + 1 };
  storage.set(app, appData);
  conduit.respond(res, { status: 200, message: { content: 'OK' } });
};
