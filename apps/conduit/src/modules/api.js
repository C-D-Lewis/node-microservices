const bodyParser = require('body-parser');

const { server } = require('@chris-lewis/node-common')(['server']);

const allocator = require('./allocator');

module.exports.setup = () => {
  server.start();

  const app = server.getExpressApp();
  
  // Support preflight
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  
  app.get('/apps', require('../api/apps'));
  app.post('/conduit', bodyParser.json(), require('../api/conduit'));
  app.get('/port', bodyParser.json(), require('../api/port'));
};
