const { promisify } = require('util');
const Vibrant = require('node-vibrant');
const { authenticate, buildAuthURL } = require('./auth');
const { log } = require('../node-common')(['log']);

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
 * When a color is rquested by Ambience.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const onColor = async (req, res) => {
  log.debug('<< /color');

  try {
    const spotifyApi = await authenticate();
    const rgbArr = await getDominantColor(await getLargestImageUrl(spotifyApi, res));

    res.status(200).send(JSON.stringify(rgbArr.map(Math.round)));
  } catch(e) {
    log.error(e);
    res.status(500).send({ error: e.stack, authUrl: buildAuthURL() });
  }
};

module.exports = {
  onColor,
};
