const {
  requestAsync, config, fcm, log
} = require('@chris-lewis/node-common')(['requestAsync', 'config', 'fcm', 'log']);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

config.requireKeys('weather.js', {
  required: ['LED_STATES'],
  properties: {
    LED_STATES: {
      required: ['DOWN', 'RAIN', 'COLD', 'HOT', 'OK'],
      properties: {
        DOWN: { type: 'array', items: { type: 'number ' } },
        RAIN: { type: 'array', items: { type: 'number ' } },
        COLD: { type: 'array', items: { type: 'number ' } },
        HOT: { type: 'array', items: { type: 'number ' } },
        OK: { type: 'array', items: { type: 'number ' } },
      },
    },
  },
});

const checkWeather = async (args) => {
  const url = `https://api.darksky.net/forecast/${args.DARKSKY_KEY}/${args.LATITUDE},${args.LONGITUDE}?units=auto&exclude=hourly`;
  const { body } = await requestAsync(url);
  if (!body) {
    throw new Error('Error checking weather: no body.');
  }

  const { currently } = JSON.parse(body);
  const temperature = Math.round(currently.apparentTemperature);
  const isRaining = currently.icon.includes('rain');
  log.info(`It's ${temperature}C, and ${isRaining ? 'is' : 'not'} raining`);

  // Order of uncomfortableness
  let state = config.LED_STATES.OK;
  if (isRaining) {
    state = config.LED_STATES.RAIN;
  } else if (temperature < args.TEMP_COLD) {
    state = config.LED_STATES.COLD;
  } else if (temperature > args.TEMP_HOT) {
    state = config.LED_STATES.HOT;
  }

  return state;
};

module.exports = async (args) => {
  if (sleep.sleeping()) {
    return;
  }

  try {
    const state = await checkWeather(args);
    display.setLed(args.LED, state);
  } catch (e) {
    log.error(e);

    fcm.post('Monitor', 'monitor', `Error checking weather: ${e.message}`);
    display.setLed(args.LED, config.LED_STATES.DOWN);
  }
};
