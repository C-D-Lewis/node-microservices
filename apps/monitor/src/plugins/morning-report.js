const { getTflIncidents, getNrIncidents } = require('../modules/delays');

const { log, ses } = require('../node-common')(['log', 'ses']);

/** Map of weather codes */
const WEATHER_CODE_MAP = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snowfall',
  73: 'Moderate snowfall',
  75: 'Heavy snowfall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

/**
 * Fetch weather summary from Open-Meteo API.
 *
 * @param {object} args - Arguments for the weather summary
 * @param {string} args.LATITUDE - Latitude for weather data
 * @param {string} args.LONGITUDE - Longitude for weather data
 * @returns {Promise<string>} - Weather summary string
 */
const fetchWeatherSummary = async (args) => {
  const url = 'https://api.open-meteo.com/v1/forecast';
  const params = new URLSearchParams({
    latitude: args.LATITUDE,
    longitude: args.LONGITUDE,
    current_weather: true,
    daily: 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max',
    wind_speed_unit: 'mph',
    temperature_unit: 'celsius',
    forecast_days: 1,
    timezone: 'auto',
  });
  const response = await fetch(`${url}?${params.toString()}`);
  const data = await response.json();
  // console.log(data);

  const {
    daily: {
      weathercode: code,
      temperature_2m_max: max,
      temperature_2m_min: min,
      precipitation_probability_max: rainChance,
      windspeed_10m_max: windSpeed,
    },
  } = data;
  const weatherSummaryToday = `Conditions: ${WEATHER_CODE_MAP[code[0]]}
Max: ${max[0] || '?'}°C, min: ${min[0]}°C
Rain chance max: ${rainChance[0]}%
Wind speed max: ${windSpeed[0]} mph`;

  return weatherSummaryToday;
};

/**
 * Format incidents for email report.
 *
 * @param {string} label - Label for the incident list
 * @param {Array<string>} incidentList - List of incidents
 * @returns {string} - Formatted incident string
 */
const formatIncidents = (label, incidentList) => (
  incidentList.length
    ? `======== ${label} ========\n${incidentList.join('\n')}\n\n`
    : `======== ${label} ========\nNo ${label} reported.\n\n`
);

/**
 * Send email for daily report.
 *
 * @param {object} args - Arguments for the report
 * @param {string} args.LATITUDE - Latitude for weather data
 * @param {string} args.LONGITUDE - Longitude for weather data
 */
module.exports = async (args = {}) => {
  // Validate args
  if (!args.LATITUDE || !args.LONGITUDE) throw new Error('Missing LATITUDE or LONGITUDE');

  let text = '';
  try {
    // Weather
    const weatherStr = await fetchWeatherSummary(args);
    text += `======== WEATHER ========\n${weatherStr}\n\n`;

    // Delays
    const tflIncidents = await getTflIncidents();
    text += formatIncidents('TFL', tflIncidents);
    const nrIncidents = await getNrIncidents();
    text += formatIncidents('NATIONAL RAIL', nrIncidents);

    // News

    // Send it
    await ses.notify(text, 'Morning Report');
    log.info('Sent report as email');
  } catch (e) {
    log.error(e);
  }
};
