const bodyParser = require('body-parser');
const { server } = require('../node-common')(['server']);

/**
 * Middleware to enable browser pre-flight requests.
 *
 * @param {object} req - Request object.
 * @param {object} res - Response object.
 * @param {Function} next - Callback for next middleware.
 */
const enablePreflight = (req, res, next) => {
  const { origin } = req.headers;

  // Explicitly mirror the origin instead of using '*'
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Needed by browsers that enforce Private Network Access
  if (req.headers['access-control-request-private-network'] === 'true') {
    res.header('Access-Control-Allow-Private-Network', 'true');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  return next();
};

/**
 * Setup the API.
 */
const setup = async () => {
  await server.start();

  const app = server.getExpressApp();
  app.use(enablePreflight);

  // Register API routes and handlers
  app.get('/ping', require('../api/ping'));
  app.post('/conduit', bodyParser.json(), require('../api/conduit'));
  app.post('/port', bodyParser.json(), require('../api/port'));
  app.post('/kill', require('../api/kill'));

  // Used for AWS TG health checks
  app.get('/', (_, res) => res.status(200).send('OK'));
};

module.exports = {
  setup,
};
