const { requestAsync, log } = require('../node-common')(['requestAsync', 'log']);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

const LED_STATE_OK = [0, 255, 0];
const LED_STATE_DOWN = [255, 0, 0];
const LED_STATE_RAIN = [0, 0, 255];
const LED_STATE_COLD = [135, 206, 250];
const LED_STATE_HOT = [255, 165, 0];

/**
 * Check weather from darksky.
 *
 * @param {object} args - plugin ARGS object.
 * @returns {number[]} LED state for weather.
 */
const checkWeather = async (args) => {
  const url = `https://api.darksky.net/forecast/${args.DARKSKY_KEY}/${args.LATITUDE},${args.LONGITUDE}?units=auto&exclude=hourly`;
  const { body } = await requestAsync(url);
  if (!body) throw new Error('Error checking weather: no body.');

  const { currently } = JSON.parse(body);
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
  if (sleep.sleeping()) return;

  try {
    const state = await checkWeather(args);
    display.setLed(args.LED, state);
  } catch (e) {
    log.error(e);

    display.setLed(args.LED, LED_STATE_DOWN);
  }
};
