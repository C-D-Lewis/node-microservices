const { log, leds } = require('../node-common')(['log', 'leds']);
const { getColor } = require('./spotifyColor');
const handles = require('./handles');

/** Interval between spotify API updates */
const SPOTIFY_INTERVAL_S = 10;

/**
 * Perform a color update using Spotify color.
 */
const spotifyColorUpdate = async () => {
  try {
    const nextRgb = await getColor();
    log.info(`spotifyColorUpdate: ${JSON.stringify(nextRgb)}`);
    leds.fadeAll(nextRgb);
  } catch (e) {
    log.error('spotifyColorUpdate failed, clearing animation');
    log.error(e);

    handles.cancelAll();
  }
};

/**
 * Begin a Spotify color loop.
 *
 * @returns {number[]} The new Spotify rgb array to be returned to the Conduit caller.
 */
const startAnimation = async () => {
  handles.cancelAll();

  // Regularly check for updates as tracks change
  const handle = setInterval(spotifyColorUpdate, SPOTIFY_INTERVAL_S * 1000);
  handles.add('spotify', handle);

  // Set initial value
  const rgbArr = await getColor();
  leds.fadeAll(rgbArr);

  return rgbArr;
};

module.exports = {
  startAnimation,
};
