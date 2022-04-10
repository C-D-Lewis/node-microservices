const {
  requestAsync, log, extract,
} = require('../node-common')(['requestAsync', 'config', 'log', 'extract']);
const display = require('../modules/display');

/** LED state for OK */
const LED_STATE_OK = [0, 255, 0];
/** LED state for DOWN */
const LED_STATE_DOWN = [255, 0, 0];
/** Map of standard state strings */
const STATES = {
  GOOD_SERVICE: 'Good service',
  MINOR_DELAYS: 'Minor delays',
  SEVERE_DELAYS: 'Severe delays',
  SPECIAL_SERVICE: 'Special service',
};
/** Greater Anglia line name */
const GREATER_ANGLIA = 'Greater Anglia';
/** TfL Rail line name */
const TFL_RAIL = 'TfL Rail';

const lastStates = {
  [GREATER_ANGLIA]: STATES.GOOD_SERVICE,
  [TFL_RAIL]: STATES.GOOD_SERVICE,
};

/**
 * Check the reaons for delays.
 *
 * @param {string} lineName - Line name to check.
 * @returns {string} Found reasons, if any.
 */
const checkReasons = async (lineName) => {
  const url = 'http://www.nationalrail.co.uk/service_disruptions/indicator.aspx';
  let { body } = await requestAsync(url);

  // Get line section
  const begin = body.indexOf(lineName);
  body = body.substring(begin, body.indexOf('</tbody>', begin));

  // Get reasons
  const reasons = [];
  while (body.includes('<td class="left">')) {
    const startIndex = body.indexOf('<td class="left">') + '<td class="left">'.length;
    const endIndex = body.indexOf('<a href', startIndex); // Follow this disruption...
    const extracted = body.substring(startIndex, endIndex);
    log.debug(`Found reason: ${extracted}`);

    if (!extracted.includes('Follow us')) reasons.push(extracted);
    body = body.substring(endIndex);
  }

  const results = (reasons.length >= 1) ? reasons.join('\n') : 'None found';
  log.info(`Reasons: ${results}`);
  return results;
};

/**
 * Check for delays on a line.
 *
 * @param {string} lineName - Line name to check.
 * @returns {boolean} true if the line is OK.
 */
const checkDelays = async (lineName) => {
  const url = 'http://www.nationalrail.co.uk/service_disruptions/indicator.aspx';
  const { body } = await requestAsync(url);
  const stateNow = extract(body, [`${lineName}</td>`, '<td>'], '</td>').trim();
  log.info(`${lineName}: '${stateNow}'`);

  // If it's changed, and not OK
  if ((stateNow !== lastStates[lineName]) && (stateNow !== STATES.GOOD_SERVICE)) {
    const reasons = await checkReasons(lineName);
    const message = `${stateNow.toUpperCase()}:\n${lineName}.\nReason: ${reasons || ''}`;
    log.debug({ reasons, message });
    lastStates[lineName] = stateNow;
  }

  return stateNow.includes(STATES.GOOD_SERVICE) || stateNow.includes(STATES.SPECIAL_SERVICE);
};

/**
 * Check TfL Rail and Greater Anglia for delays.
 *
 * @param {object} args - plugin ARGS object.
 */
module.exports = async (args) => {
  // TODO: Configurable service line names in ARGS
  try {
    // const gaOk = await checkDelays(GREATER_ANGLIA);
    const tflOk = await checkDelays(TFL_RAIL);
    display.setLed(
      args.LED,
      (/* gaOk && */tflOk) ? LED_STATE_OK : LED_STATE_DOWN,
    );
  } catch (e) {
    log.error(e);

    display.setLed(args.LED, LED_STATE_DOWN);
  }
};
