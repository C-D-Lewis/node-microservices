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
          required: ['DOWN', 'RAIN', 'COLD', 'HOT', 'FAIR'],
          properties: {
            DOWN: { type: 'array', items: { type: 'number' } },
            RAIN: { type: 'array', items: { type: 'number' } },
            COLD: { type: 'array', items: { type: 'number' } },
            HOT: { type: 'array', items: { type: 'number' } },
            FAIR: { type: 'array', items: { type: 'number' } },
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
 * @returns {number[][]} LED states for weather.
 */
const getForecastLedStates = async (args) => {
  const url = `https://api.darksky.net/forecast/${args.DARKSKY_KEY}/${args.LATITUDE},${args.LONGITUDE}?units=auto&exclude=minutely`;
  const { body } = await requestAsync(url);
  if (!body) throw new Error('Error checking weather: no body.');

  const json = JSON.parse(body);
  const { data } = json.hourly;
  const forecast = data.slice(0, args.HOURS_AHEAD).map(p => ({
    time: p.time * 1000,
    icon: p.icon,
    precipProbability: p.precipProbability,
    precipType: p.precipType,
    apparentTemperature: Math.round(p.apparentTemperature),
  }));

  const str = forecast.map((p) => {
    const d = new Date(p.time);
    return `${d.getHours()}:00: ${p.apparentTemperature}C ${p.icon} ${p.precipProbability}`;
  }).join('\n');
  log.info(`\n${str}`);

  const ledStates = forecast.map((p) => {
    const { icon, apparentTemperature } = p;
    const isRaining = icon.includes('rain');

    // Order of uncomfortableness
    if (isRaining) return LED_STATES.RAIN;
    if (apparentTemperature < args.TEMP_COLD) return LED_STATES.COLD;
    if (apparentTemperature > args.TEMP_HOT) return LED_STATES.HOT;
    return LED_STATES.FAIR;
  });

  return ledStates;
};

/**
 * Check weather from darksky and set an 8 hour forecast on LEDs 0 - 8.
 *
 * @param {Object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  if (sleep.sleeping()) return;

  try {
    const ledStates = await getForecastLedStates(args);
    for (let i = 0; i < ledStates.length; i++) {
      await display.setLed(i, ledStates[i]);
    }
  } catch (e) {
    log.error(e);

    fcm.post('Monitor', 'monitor', `Error checking forecast: ${e.message}`);
    display.setLed(args.LED, LED_STATES.DOWN);
  }
};
