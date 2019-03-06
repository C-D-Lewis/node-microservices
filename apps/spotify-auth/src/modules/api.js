const { server } = require('../node-common')(['server']);

const auth = require('./auth');
const color = require('./color');

const setup = () => {
  server.start();
  const app = server.getExpressApp();

  app.get('/callback', auth.onCallback);
  app.get('/color', color.onColor);
};

module.exports = { setup };
