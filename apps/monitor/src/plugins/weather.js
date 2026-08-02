const { fetch, log } = require('../node-common')(['fetch', 'log']);
const visuals = require('../modules/visuals');

/** LED state for OK */
const LED_STATE_OK = [0, 255, 0];
/** LED state for DOWN */
const LED_STATE_DOWN = [255, 0, 0];
/** LED state for RAIN */
const LED_STATE_RAIN = [0, 0, 255];
/** LED state for COLD */
const LED_STATE_COLD = [135, 206, 250];
/** LED state for HOT */
const LED_STATE_HOT = [255, 165, 0];

/**
 * Check weather from darksky.
 *
 * @param {object} args - plugin ARGS object.
 * @returns {number[]} LED state for weather.
 */
const checkWeather = async (args) => {
  const url = `https://api.darksky.net/forecast/${args.DARKSKY_KEY}/${args.LATITUDE},${args.LONGITUDE}?units=auto&exclude=hourly`;
  const { data } = await fetch(url);

  const { currently } = data;
  const temperature = Math.round(currently.apparentTemperature);
  const isRaining = currently.icon.includes('rain');
  log.info(`It's ${temperature}C, and ${isRaining ? 'is' : 'not'} raining`);

  // Order of uncomfortableness
  if (isRaining) return LED_STATE_RAIN;
  if (temperature < args.TEMP_COLD) return LED_STATE_COLD;
  if (temperature > args.TEMP_HOT) return LED_STATE_HOT;

  return LED_STATE_OK;
};

/**
 * Check weather from darksky.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  // Validate required args
  if (!args || typeof args !== 'object') throw new Error('args must be an object');
  if (typeof args.DARKSKY_KEY !== 'string') throw new Error('DARKSKY_KEY is required');
  if (typeof args.LATITUDE !== 'number') throw new Error('LATITUDE is required');
  if (typeof args.LONGITUDE !== 'number') throw new Error('LONGITUDE is required');
  if (typeof args.TEMP_COLD !== 'number') throw new Error('TEMP_COLD is required');
  if (typeof args.TEMP_HOT !== 'number') throw new Error('TEMP_HOT is required');
  if (typeof args.LED === 'undefined') throw new Error('LED is required');

  try {
    const state = await checkWeather(args);
    visuals.setLed(args.LED, state);
  } catch (e) {
    log.error(e);

    visuals.setLed(args.LED, LED_STATE_DOWN);
  }
};
