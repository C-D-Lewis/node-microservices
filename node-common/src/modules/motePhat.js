const { execSync, spawn } = require('child_process');
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
  const cmdPath = `${__dirname}/../lib/mote-phat-server.py`;
  const proc = spawn('python', [cmdPath]);
  proc.stdout.on('data', data => log.info(`phat server stdout: ${data.toString()}`));
  proc.stderr.on('data', data => log.error(`phat server stderr: ${data.toString()}`));
  proc.on('exit', code => log.error(`phat server exited with code ${code.toString()}`));

  log.info('Started mote phat server');
};

const setAllServer = async (rgb) => {
  log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`);

  try {
    await requestAsync({
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
