const {
  requestAsync, config, fcm, log,
} = require('../node-common')(['requestAsync', 'config', 'fcm', 'log']);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

config.requireKeys('weather.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['LED_STATES'],
      properties: {
        LED_STATES: {
          required: ['DOWN', 'RAIN', 'COLD', 'HOT', 'OK'],
          properties: {
            DOWN: { type: 'array', items: { type: 'number' } },
            RAIN: { type: 'array', items: { type: 'number' } },
            COLD: { type: 'array', items: { type: 'number' } },
            HOT: { type: 'array', items: { type: 'number' } },
            OK: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
  },
});

const { LED_STATES } = config.OPTIONS;

/**
 * Check weather from darksky.
 *
 * @param {Object} args - plugin ARGS object.
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
  if (isRaining) return LED_STATES.RAIN;
  if (temperature < args.TEMP_COLD) return LED_STATES.COLD;
  if (temperature > args.TEMP_HOT) return LED_STATES.HOT;

  return LED_STATES.OK;
};

/**
 * Check weather from darksky.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  if (sleep.sleeping()) return;

  try {
    const state = await checkWeather(args);
    display.setLed(args.LED, state);
  } catch (e) {
    log.error(e);

    fcm.post('Monitor', 'monitor', `Error checking weather: ${e.message}`);
    display.setLed(args.LED, LED_STATES.DOWN);
  }
};
