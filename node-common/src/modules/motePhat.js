const { execSync, exec } = require('child_process');
const requestAsync = require('./requestAsync');
const log = require('./log');

const MOTE_PHAT_SERVER_POST = 35275;

const setAll = (rgb) => {
  log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`);

  execSync(`python ${`${__dirname}/../lib/mote-phat-all.py`} ${rgb[0]} ${rgb[1]} ${rgb[2]}`);
};

const setPixels = (leds) => {
  log.assert(Array.isArray(leds), `leds must be an array. Was ${leds}`);
  leds.forEach(rgb => log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`));

  execSync(`python ${`${__dirname}/../lib/mote-phat-pixels.py`} ${JSON.stringify(leds)}`);
};

const startServer = async () => {
  const cmdPath = `${__dirname}/../lib/run-mote-phat-server.sh`;
  log.info(`Starting mote phat server; ${cmdPath}`);
  exec(`sh ${cmdPath}`);
  log.info('Started mote phat server');
};

const setAllServer = async (rgb) => {
  log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`);

  try {
    return requestAsync({
      url: `http://localhost:${MOTE_PHAT_SERVER_POST}/setall`,
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ all: rgb }),
    });
  } catch (e) {
    log.error(e);
    log.error('Is mote-phat-server.py running?');
  }
};

module.exports = {
  setAll,
  setAllServer,
  startServer,
  setPixels,
};
