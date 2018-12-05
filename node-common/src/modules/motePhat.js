const { execSync } = require('child_process');

const config = require('./config');
const log = require('./log');

const setAll = (rgb) => {
  log.assert(Array.isArray(rgb), `rgb is an array. Was ${rgb}`);

  execSync(`python ${`${__dirname}/../lib/mote-phat-all.py`} ${rgb[0]} ${rgb[1]} ${rgb[2]}`);
};

const setPixels = (leds) => {
  log.assert(Array.isArray(leds), `leds is an array. Was ${leds}`);
  leds.forEach(rgb => log.assert(Array.isArray(rgb), `rgb is an array. Was ${rgb}`));

  execSync(`python ${`${__dirname}/../lib/mote-phat-pixels.py`} ${JSON.stringify(leds)}`);
};

module.exports = {
  setAll,
  setPixels,
};
