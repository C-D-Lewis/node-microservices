const bodyParser = require('body-parser');
const { server } = require('../node-common')(['server']);
const allocator = require('./allocator');

/**
 * Middleware to enable browser pre-flight requests.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 * @param {function} next - Callback for next middleware.
 */
const enablePreflight = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
};

const setup = () => {
  server.start();

  const app = server.getExpressApp();
  app.use(enablePreflight);
  app.get('/apps', require('../api/apps'));
  app.post('/conduit', bodyParser.json(), require('../api/conduit'));
  app.get('/port', bodyParser.json(), require('../api/port'));
  app.post('/upgrade', require('../api/upgrade'));
};

module.exports = {
  setup,
};
