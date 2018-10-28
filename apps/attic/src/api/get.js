const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

const storage = require('../modules/storage');

module.exports = (packet, res) => {
  log.debug(`<< get ${JSON.stringify(packet.message)}`);

  const { app, key } = packet.message;
  const appData = storage.get(app);
  if(!appData || !appData[key]) {
    conduit.respond(res, {
      status: 404,
      error: `app ${app} or key ${key} not found`
    });
    return;
  }

  const data = appData[key];
  const { value, timestamp } = data;
  conduit.respond(res, {
    status: 200,
    message: { app, key, value, timestamp }
  });
};
