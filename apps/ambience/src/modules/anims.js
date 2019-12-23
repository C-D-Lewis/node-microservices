const request = require('request');
const {
  requestAsync, config, conduit, log,
} = require('../node-common')(['requestAsync', 'config', 'conduit', 'log']);

config.requireKeys('anims.js', {
  required: ['SPOTIFY_AUTH'],
  properties: {
    SPOTIFY_AUTH: {
      required: ['URL', 'PORT'],
      properties: {
        URL: { type: 'string' },
        PORT: { type: 'number' },
      },
    },
  },
});

/** Interval between demo color changes */
const DEMO_INTERVAL_S = 30;
/** Interval between spotify API updates */
const SPOTIFY_INTERVAL_S = 10;
/** Step change amount when fading */
const FADE_STEP = 5;
/** Colors used in the 'demo' mode */
const DEMO_COLORS = [
  [255, 0, 0],    // Red
  [255, 127, 0],  // Orange
  [255, 255, 0],  // Yellow
  [127, 255, 0],  // Lime green
  [0, 255, 0],    // Green
  [0, 255, 127],  // Pastel green
  [0, 255, 255],  // Cyan
  [0, 127, 255],  // Sky blue
  [0, 0, 255],    // Blue
  [127, 0, 255],  // Purple
  [255, 0, 255],  // Pink
  [255, 0, 127],  // Hot pink
];

let currentRgb = [20, 0, 0];
let targetRgb = [20, 0, 0];
let demoHandle = null;
let spotifyHandle = null;

/**
 * Determine if the fading process is complete.
 *
 * @returns {boolean} true if the current value matches the target value.
 */
const fadeIsComplete = () => currentRgb.every((p, i) => targetRgb[i] === p);

/**
 * Generate a random integer within a range.
 *
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number}
 */
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

/**
 * Do a fade step
 */
const fadeStep = async () => {
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
 * Begin a demo color loop.
 */
const demo = () => {
  clearAll();

  let current = 0;
  demoHandle = setInterval(() => {
    let next = current;
    while(next === current) {
      next = getRandomInt(0, DEMO_COLORS.length);
    }

    current = next;
    fadeTo(DEMO_COLORS[next]);
  }, DEMO_INTERVAL_S * 1000);

  fadeTo([255, 255, 255]);
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
 * Get the spotify color using Spotify-Auth service.
 *
 * TODO: Move this logic into here so concierge can receive the callback instead of Spotify-Auth.
 */
const getSpotifyColor = async () => {
  log.debug('>> $SPOTIFY_AUTH/color');

  // Fetch from spotify-auth, if credentials are valid
  const url = `${config.SPOTIFY_AUTH.URL}:${config.SPOTIFY_AUTH.PORT}/color`;
  const { response, body } = await requestAsync(url);
  if (response.statusCode !== 200) {
    throw new Error(`getSpotifyColor() failed: ${body}`);
  }

  // Response is [r,g,b] JSON array
  return JSON.parse(body).map(Math.round);
};

/**
 * Begin a Spotify color loop.
 *
 * @returns {number[]} The new Spotify rgb array to be returned to the Conduit caller.
 */
const spotify = async () => {
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
  clearInterval(demoHandle);
  clearInterval(spotifyHandle);

  demoHandle = null;
  spotifyHandle = null;
};

module.exports = {
  fadeTo,
  demo,
  clearAll,
  spotify,
};
