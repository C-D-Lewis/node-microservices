const { promisify } = require('util');

const Vibrant = require('node-vibrant');

const { log } = require('@chris-lewis/node-common')(['log']);

const auth = require('./auth');

const getLargestImageUrl = async (spotifyApi, res) => {
  const getMyCurrentPlaybackState = promisify(spotifyApi.getMyCurrentPlaybackState).bind(spotifyApi);
  const data = await getMyCurrentPlaybackState('UK');

  if(!data.body.item) throw new Error('Nothing is playing');

  const { images } = data.body.item.album;
  const height = images.reduce((result, item) => (item.height > result) ? item.height : result, 0);
  return images.find(item => item.height === height).url;
};

const getDominantColor = async (url) => {
  const vibrant = new Vibrant(url);
  const getPalette = promisify(vibrant.getPalette).bind(vibrant);
  const palette = await getPalette();

  if(palette.Vibrant) return palette.Vibrant._rgb;
  if(palette.LightVibrant) return palette.LightVibrant._rgb;
  return [0, 0, 0];
};

const onColor = async (req, res) => {
  log.debug('<< /color');

  try {
    const spotifyApi = await auth.authenticate();
    const url = await getLargestImageUrl(spotifyApi, res);
    const rgbArr = await getDominantColor(url);

    res.status(200);
    res.send(JSON.stringify(rgbArr.map(Math.round)));
  } catch(e) {
    log.error(e);
    res.status(500);
    res.send({ error: e.message, authUrl: auth.buildAuthURL() });
  }
}

module.exports = { onColor };
