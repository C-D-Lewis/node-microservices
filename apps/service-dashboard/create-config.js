const { writeFileSync } = require('fs');

const {
  FLEET_HOST,
} = process.env;

const config = {
  FLEET_HOST,
};

writeFileSync(`${__dirname}/config.js`, `window.config=${JSON.stringify(config, null, 2)};`, 'utf8');
