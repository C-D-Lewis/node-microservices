const { server } = require('../node-common')(['server']);
const { onCallback } = require('./auth');
const { onColor } = require('./color');

/**
 * Start the server and register external callbacks.
 */
const setup = () => {
  server.start();
  const app = server.getExpressApp();

  app.get('/spotifyCallback', onCallback);
  app.get('/color', onColor);
};

module.exports = {
  setup,
};
