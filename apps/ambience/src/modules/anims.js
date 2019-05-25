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

const DEMO_INTERVAL_S = 30;
const SPOTIFY_INTERVAL_S = 10;
const FADE_STEP = 5;
const DEMO_COLORS = [
  [255, 0, 0],
  [255, 127, 0],
  [255, 255, 0],
  [127, 255, 0],
  [0, 255, 0],
  [0, 255, 127],
  [0, 255, 255],
  [0, 127, 255],
  [0, 0, 255],
  [127, 0, 255],
  [255, 0, 255],
  [255, 0, 127],
];

let currentRgb = [20, 0, 0];
let targetRgb = [20, 0, 0];
let demoHandle = null;
let spotifyHandle = null;

const fadeIsComplete = () => (currentRgb[0] === targetRgb[0] &&
  currentRgb[1] === targetRgb[1] &&
  currentRgb[2] === targetRgb[2]);

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const fadeStep = async () => {
  if (fadeIsComplete()) {
    log.debug('Fade complete');
    return;
  }

  for (let i = 0; i < targetRgb.length; i++) {
    const c = currentRgb[i];
    const t = targetRgb[i];
    const diff = Math.abs(t - c);
    if (c < t) {
      currentRgb[i] += (diff >= FADE_STEP) ? FADE_STEP : diff;
    } else if (c > t) {
      currentRgb[i] -= (diff >= FADE_STEP) ? FADE_STEP : diff;
    }
  }

  await conduit.send({
    to: 'visuals', topic: 'setAll', message: { all: currentRgb },
  });

  fadeStep();
};

const fadeTo = (nextRgb) => {
  // FIXME: Can't clearAll() here because used in demo() that has demoHandle
  // clearAll();

  if (!log.assert(Array.isArray(nextRgb), `nextRgb ${nextRgb} must be array`, false)) {
    return;
  }

  targetRgb = nextRgb;
  log.debug(`Fading: currentRgb=${JSON.stringify(currentRgb)} > ${JSON.stringify(targetRgb)}`);
  fadeStep();
};

const demo = () => {
  clearAll();

  let current = 0;
  demoHandle = setInterval(() => {
    let next = current;
    while(next == current) {
      next = getRandomInt(0, DEMO_COLORS.length);
    }

    current = next;
    fadeTo(DEMO_COLORS[next]);
  }, DEMO_INTERVAL_S * 1000);

  fadeTo([255, 255, 255]);
};

const colorUpdate = async () => {
  try {
    fadeTo(await getColor());
  } catch (e) {
    log.error('colorUpdate failed');
    log.error(e);

    clearAll();
  }
};

const getColor = async () => {
  log.debug('>> /color');

  // Fetch from spotify-auth, if credentials are valid
  const url = `${config.SPOTIFY_AUTH.URL}:${config.SPOTIFY_AUTH.PORT}/color`;
  const { response, body } = await requestAsync(url);
  if (response.statusCode !== 200) {
    throw new Error(`getColor() failed: ${body}`);
  }

  return JSON.parse(body).map(Math.round);
};

// TODO Decouple API response from running the animation
const spotify = async (packet, res) => {
  clearAll();

  spotifyHandle = setInterval(colorUpdate, SPOTIFY_INTERVAL_S * 1000);

  try {
    const rgbArr = await getColor();
    fadeTo(rgbArr);

    conduit.respond(res, { status: 200, message: { content: rgbArr } });
  } catch (e) {
    log.error(e);
    conduit.respond(res, { status: 500, error: e.message });
  }
};

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
