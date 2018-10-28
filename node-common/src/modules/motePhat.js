const { execSync } = require('child_process');

const config = require('./config');
const log = require('./log');

const setAll = (rgbArr) => {
  log.assert(Array.isArray(rgbArr), `rgbArr is an array. Was ${rgbArr}`);

  const path = `${__dirname}/../lib/mote-phat-all.py`;
  execSync(`python ${path} ${rgbArr[0]} ${rgbArr[1]} ${rgbArr[2]}`);
};

const setPixels = (ledArr) => {
  log.assert(Array.isArray(ledArr), `ledArr is an array. Was ${ledArr}`);
  ledArr.forEach(rgbArr => log.assert(Array.isArray(rgbArr), `Each element is an array. Was ${rgbArr}`));

  const path = `${__dirname}/../lib/mote-phat-pixels.py`;
  execSync(`python ${path} ${JSON.stringify(ledArr)}`);
};

module.exports = { setAll, setPixels };
