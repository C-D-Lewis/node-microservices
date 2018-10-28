const {
  log, conduit
} = require('@chris-lewis/node-common')(['log', 'conduit']);

const storage = require('../modules/storage');

module.exports = (packet, res) => {
  log.debug(`<< increment ${JSON.stringify(packet.message)}`);

  const { app, key } = packet.message;
  const appData = storage.get(app);
  if(!appData || !appData[key]) {
    conduit.respond(res, {
      status: 404,
      error: `app ${app} or key ${key} not found`
    });
    return;
  }

  const value = appData[key].value;
  if(typeof value !== 'number') {
    conduit.respond(res, {
      status: 400,
      error: `value ${value} is not a number, cannot increment`
    });
    return;
  }

  appData[key] = {
    timestamp: Date.now(),
    value: value + 1
  };
  storage.set(app, appData);
  conduit.respond(res, {
    status: 200,
    message: { content: 'OK' }
  });
};
