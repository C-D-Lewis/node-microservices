const request = require('request');
const { requestAsync, config, conduit, log } = require('../node-common')(['requestAsync', 'config', 'conduit', 'log']);

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

const FADE_INTERVAL_MS = 10;
const DEMO_INTERVAL_S = 30;
const SPOTIFY_INTERVAL_S = 10;
const STEP = 5;
const ATTENUATION_FACTOR = 1; // Set normal RGB, auto attenuate
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
  [255, 0, 127]
];

let current = [20, 0, 0];
let target = [20, 0, 0];
let demoHandle = null, spotifyHandle = null;
let lastDemoIndex = [0,0,0];

const fadeIteration = async () => {
  if(fadeIsComplete()) {
    log.debug('Fade complete');
    return;
  }

  for(let i = 0; i < target.length; i++) {
    const c = current[i];
    const t = target[i];
    const diff = Math.abs(t - c);
    if(c < t) current[i] += (diff >= STEP) ? STEP : diff;
    else if(c > t) current[i] -= (diff >= STEP) ? STEP : diff;
  }

  await conduit.send({
    to: 'visuals', topic: 'setAll', message: { all: current }
  });

  fadeIteration();
};

const fadeTo = (rgbArr) => {
  if(!log.assert(Array.isArray(rgbArr), `rgbArr ${rgbArr} must be array`, false)) return;

  target = rgbArr;
  log.debug(`Fading: current=${JSON.stringify(current)} > ${JSON.stringify(target)}`);
  fadeIteration();
};

const demo = () => {
  clearAll();
  demoHandle = setInterval(() => {
    let index = lastDemoIndex;
    while(index == lastDemoIndex) index = getRandomInt(0, DEMO_COLORS.length);

    lastDemoIndex = index;
    fadeTo(DEMO_COLORS[index]);
  }, DEMO_INTERVAL_S * 1000);
  fadeTo([255, 255, 255]);
};

const colorUpdate = async () => {
  try {
    const rgbArr = await getColor();
    fadeTo(rgbArr);
  } catch (e) {
    clearAll();
  }
};

const getColor = async () => {
  log.debug('>> /color');

  const url = `${config.SPOTIFY_AUTH.URL}:${config.SPOTIFY_AUTH.PORT}/color`;
  const { response, body } = await requestAsync(url);
  if(response.statusCode !== 200) {
    throw new Error(`getColor() failed: ${body}`);
  }

  return JSON.parse(body).map(Math.round);
};

const spotify = async (packet, res) => {
  clearAll();

  try {
    const rgbArr = await getColor();
    spotifyHandle = setInterval(colorUpdate, SPOTIFY_INTERVAL_S * 1000);
    fadeTo(rgbArr);

    conduit.respond(res, { status: 200, message: { content: rgbArr } });
  } catch (e) {
    conduit.respond(res, { status: 500, error: e.message });
  }
};

const clearAll = () => {
  if(demoHandle) clearInterval(demoHandle);
  if(spotifyHandle) clearInterval(spotifyHandle);

  demoHandle = null;
  spotifyHandle = null;
};

const fadeIsComplete = () => (current[0] === target[0] &&
  current[1] === target[1] &&
  current[2] === target[2]);

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

module.exports = { fadeTo, demo, clearAll, spotify };
