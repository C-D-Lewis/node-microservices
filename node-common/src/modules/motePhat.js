const { execSync } = require('child_process');
const log = require('./log');

// const MOTE_PHAT_SERVER_POST = 35275;

/**
 * Set all Mote LEDs to a given color.
 *
 * @param {Array<number>} rgb - New colors.
 */
const setAll = (rgb) => {
  log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`);

  try {
    const res = execSync(`python3 ${`${__dirname}/../lib/mote-phat-all.py`} ${rgb[0]} ${rgb[1]} ${rgb[2]}`);
    log.debug(res.toString());
  } catch (e) {
    log.error(e);
  }
};

/**
 * Set all Mote LEDs to a given color.
 *
 * @param {Array<object>} leds - List of RGB arrays for each pixel.
 */
const setPixels = (leds) => {
  log.assert(Array.isArray(leds), `leds must be an array. Was ${leds}`);
  leds.forEach((rgb) => log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`));

  try {
    const res = execSync(`python3 ${`${__dirname}/../lib/mote-phat-pixels.py`} ${JSON.stringify(leds)}`);
    log.debug(res.toString());
  } catch (e) {
    log.error(e);
  }
};

/**
 * Set all Mote LEDs to a given color.
 *
 * @param {Array<number>} toRgb - New colors.
 * @param {Array<number>} fromRgb - Previous colors.
 */
const fadeAll = (toRgb, fromRgb) => {
  log.assert(Array.isArray(toRgb), `toRgb must be an array. Was ${toRgb}`);
  log.assert(Array.isArray(fromRgb), `fromRgb must be an array. Was ${fromRgb}`);

  try {
    const res = execSync(`python3 ${`${__dirname}/../lib/mote-phat-fade.py`} ${fromRgb[0]} ${fromRgb[1]} ${fromRgb[2]} ${toRgb[0]} ${toRgb[1]} ${toRgb[2]}`);
    log.debug(res.toString());
  } catch (e) {
    log.error(e);
  }
};

// This is still slower (and buggy) compared to fading in Python
// const startServer = async () => {
//   const cmdPath = `${__dirname}/../lib/mote-phat-server.py`;
//   const proc = spawn('python', [cmdPath]);
//   proc.stdout.on('data', data => log.info(`phat server stdout: ${data.toString()}`));
//   proc.stderr.on('data', data => log.error(`phat server stderr: ${data.toString()}`));
//   proc.on('exit', code => log.error(`phat server exited with code ${code.toString()}`));
//
//   log.info('Started mote phat server');
// };
//
// const setAllServer = async (rgb) => {
//   log.assert(Array.isArray(rgb), `rgb must be an array. Was ${rgb}`);
//
//   try {
//     await fetch({
//       url: `http://localhost:${MOTE_PHAT_SERVER_POST}/setall`,
//       method: 'post',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ all: rgb }),
//     });
//   } catch (e) {
//     log.error(e);
//     log.error('Is mote-phat-server.py running?');
//   }
// };

module.exports = {
  setAll,
  setPixels,
  fadeAll,

  // setAllServer,
  // startServer,
};
