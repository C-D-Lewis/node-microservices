const {
  fetch, log, extract,
} = require('../node-common')(['fetch', 'config', 'log', 'extract']);
const { createAlert } = require('../modules/alert');

/** TfL API modes to query */
const MODES = ['tube', 'elizabeth-line'];

const lastStates = {};

/**
 * Check for delays on a line.
 *
 * @param {string} lineName - Line name to check.
 * @returns {boolean} true if the line is OK.
 */
const checkNationalRail = async (lineName) => {
  const url = 'https://www.nationalrail.co.uk/status-and-disruptions/?mode=train-operator-status';
  const { body } = await fetch(url);
  const disruptions = extract(
    body,
    ['Disruptions on these operators'],
    'Good service for all other operators',
  ).trim();

  return disruptions.includes(lineName);
};

const checkTflStatus = async (lineId) => {
  const url = `https://api.tfl.gov.uk/line/mode/${MODES.join(',')}/status`;
  const { data } = await fetch(url);

  const line = data.find(p => p.id === lineId);
  return !line?.lineStatuses[0]?.statusSeverityDescription.includes('Good');
};

/**
 * Check fail services for delays.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  // TODO: Configurable service line names in ARGS
  try {
    const greaterAngliaDelayed = await checkNationalRail('Greater Anglia');
    const jubileeDelayed = await checkTflStatus('jubilee');
    console.log({ greaterAngliaDelayed, jubileeDelayed });

    // Alarm, only during right hours (mon-fri)
  } catch (e) {
    log.error(e);
  }
};
