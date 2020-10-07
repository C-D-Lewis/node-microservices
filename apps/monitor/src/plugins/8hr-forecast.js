const {
  requestAsync, fcm, log,
} = require('../node-common')(['requestAsync', 'fcm', 'log']);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

const LED_STATE_DOWN = [255, 0, 0];
const LED_STATE_RAIN = [0, 0, 255];
const LED_STATE_COLD = [135, 206, 250];
const LED_STATE_HOT = [255, 165, 0];
const LED_STATE_FAIR = [30, 30, 30];

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
    if (isRaining) return LED_STATE_RAIN;
    if (apparentTemperature < args.TEMP_COLD) return LED_STATE_COLD;
    if (apparentTemperature > args.TEMP_HOT) return LED_STATE_HOT;
    return LED_STATE_FAIR;
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
    display.setLed(args.LED, LED_STATE_DOWN);
  }
};
