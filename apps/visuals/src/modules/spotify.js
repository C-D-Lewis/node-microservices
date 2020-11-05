const { log } = require('../node-common')(['log']);
const { getColor } = require('./spotifyColor');
const handles = require('./handles');

/** Interval between spotify API updates */
const SPOTIFY_INTERVAL_S = 10;

const fadeTo = rgb => { /** Implement in visuals fade */ };

/**
 * Perform a color update using Spotify color.
 */
const spotifyColorUpdate = async () => {
  try {
    fadeTo(await getColor());
  } catch (e) {
    log.error('spotifyColorUpdate failed, clearing animation');
    log.error(e);

    handles.remove('spotify');
  }
};

/**
 * Begin a Spotify color loop.
 *
 * @returns {number[]} The new Spotify rgb array to be returned to the Conduit caller.
 */
const startAnimation = async () => {
  // Set initial value
  const rgbArr = await getColor();
  fadeTo(rgbArr);

  // Regularly check for updates as tracks change
  const handle = setInterval(spotifyColorUpdate, SPOTIFY_INTERVAL_S * 1000);
  handles.add('spotify', handle);

  return rgbArr;
};

module.exports = {
  startAnimation,
};
