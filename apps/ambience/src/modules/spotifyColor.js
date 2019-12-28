const { promisify } = require('util');
const Vibrant = require('node-vibrant');
const { log } = require('../node-common')(['log']);
const { createSpotifyClient, buildAuthURL } = require('./spotifyAuth');

/**
 * Get the URL of the largest album art available.
 *
 * @param {Object<Spotify>} spotifyApi - Spotify API object.
 * @returns {string} URL of the largest available album art image.
 */
const getLargestImageUrl = async (spotifyApi) => {
  const getMyCurrentPlaybackStateAsync = promisify(spotifyApi.getMyCurrentPlaybackState)
    .bind(spotifyApi);
  const { body } = await getMyCurrentPlaybackStateAsync('UK');

  if (!body || !body.item) {
    throw new Error('Nothing is playing!');
  }

  const { images } = body.item.album;
  const largest = images.reduce((acc, p) => (p.height > acc) ? p.height : acc, 0);
  return images.find(p => p.height === largest).url;
};

/** Use Vibrant to get the dominant color in the album art image.
*
* @param {string} url - URL to use.
* @returns {number[]} rgb array of color channel values.
*/
const getDominantColor = async (url) => {
  const vibrant = new Vibrant(url);
  const getPaletteAsync = promisify(vibrant.getPalette).bind(vibrant);
  const palette = await getPaletteAsync();

  // Use Vibrant color, else, LightVibrant, else black
  return (palette.Vibrant)
    ? palette.Vibrant._rgb
    : ((palette.LightVibrant)
      ? palette.LightVibrant._rgb
      : [0, 0, 0]);
};

/**
 * Perform the actual color extraction using spotifyAuth.js
 *
 * @returns {Promise<number[]} Resolves RGB array for album art vibrant color.
 */
const getSpotifyColor = async () => {
  try {
    const spotifyApi = await createSpotifyClient();
    const url = await getLargestImageUrl(spotifyApi);
    const rgbArr = await getDominantColor(url);

    return rgbArr.map(Math.round);
  } catch(e) {
    log.error(e);
    throw new Error(buildAuthURL());
  }
};

module.exports = {
  getSpotifyColor,
};
