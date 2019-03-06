const { log, conduit } = require('../node-common')(['log', 'conduit']);

const storage = require('../modules/storage');

module.exports = (packet, res) => {
  log.debug(`<< set ${JSON.stringify(packet.message)}`);
  const { app, key, value } = packet.message;

  let appData = storage.get(app);
  if(!appData) appData = {};

  appData[key] = {
    value: value,
    timestamp: new Date().getTime()
  };
  storage.set(app, appData);
  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
