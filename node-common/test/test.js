const {
  log, config, db,
} = require('@chris-lewis/node-common')(['log', 'config', 'db']);

log.info('Log test!');
log.info(config.LOG);
db.set('key', 'value');
log.info(db.get('key'));