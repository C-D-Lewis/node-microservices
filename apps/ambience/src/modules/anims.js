const request = require('request');
const { conduit, log } = require('../node-common')(['conduit', 'log']);
const { getSpotifyColor } = require('./spotifyColor');

/** Interval between spotify API updates */
const SPOTIFY_INTERVAL_S = 10;
/** Step change amount when fading */
const FADE_STEP = 5;

let currentRgb = [20, 0, 0];
let targetRgb = [20, 0, 0];
let spotifyHandle = null;

/**
 * Determine if the fading process is complete.
 *
 * @returns {boolean} true if the current value matches the target value.
 */
const fadeIsComplete = () => currentRgb.every((p, i) => targetRgb[i] === p);

/**
 * Do a fade step
 */
const fadeStep = async () => {
  // FIXME: Now it is recurvives, hard to cancel
  if (fadeIsComplete()) {
    log.debug('Fade complete');
    return;
  }

  targetRgb.forEach((t, i) => {
    const c = currentRgb[i];
    const diff = Math.abs(t - c);
    currentRgb[i] += ((diff >= FADE_STEP) ? FADE_STEP : diff) * (c > t ? -1 : 1);
  });

  await conduit.send({ to: 'visuals', topic: 'setAll', message: { all: currentRgb } });

  fadeStep();
};

/**
 * Begin fading to a new value.
 *
 * @param {string[]} nextRgb - Next target rgb value.
 */
const fadeTo = (nextRgb) => {
  // FIXME: Can't clearAll() here because used in demo() that has demoHandle
  // clearAll();

  if (!log.assert(Array.isArray(nextRgb), `nextRgb ${nextRgb} must be array`, false)) {
    return;
  }

  targetRgb = nextRgb;
  log.debug(`Fading: ${JSON.stringify(currentRgb)} > ${JSON.stringify(targetRgb)}`);
  fadeStep();
};

/**
 * Perform a color update using Spotify color.
 */
const spotifyColorUpdate = async () => {
  try {
    fadeTo(await getSpotifyColor());
  } catch (e) {
    log.error('spotifyColorUpdate failed, clearing all animations');
    log.error(e);

    clearAll();
  }
};

/**
 * Begin a Spotify color loop.
 *
 * @returns {number[]} The new Spotify rgb array to be returned to the Conduit caller.
 */
const spotifyAnimation = async () => {
  clearAll();

  const rgbArr = await getSpotifyColor();
  fadeTo(rgbArr);

  // Regularly check for updates as tracks change
  spotifyHandle = setInterval(spotifyColorUpdate, SPOTIFY_INTERVAL_S * 1000);

  return rgbArr;
};

/**
 * Clear all animation handles.
 */
const clearAll = () => {
  clearInterval(spotifyHandle);

  spotifyHandle = null;
};

module.exports = {
  fadeTo,
  clearAll,
  spotifyAnimation,
};
