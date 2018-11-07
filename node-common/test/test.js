const {
  log, config, db,
} = require('../src/main.js')(['log', 'config', 'db']);

log.info('Log test!');
log.info(config.LOG);
db.set('key', 'value');
log.info(db.get('key'));