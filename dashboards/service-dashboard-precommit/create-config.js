const { writeFileSync } = require('fs');

const {
  /** Where the fleet can be found. */
  FLEET_HOST = 'localhost',
} = process.env;

const config = {
  FLEET_HOST,
};

writeFileSync(`${__dirname}/config.js`, `window.config=${JSON.stringify(config, null, 2)};`, 'utf8');
