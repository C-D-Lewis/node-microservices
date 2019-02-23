const {
  requestAsync, conduit, config, fcm, log, extract
} = require('@chris-lewis/node-common')([
  'requestAsync', 'conduit', 'config', 'fcm', 'log', 'extract'
]);
const display = require('../modules/display');
const sleep = require('../modules/sleep');

config.requireKeys('delays.js', {
  required: ['OPTIONS'],
  properties: {
    OPTIONS: {
      required: ['LED_STATES'],
      properties: {
        LED_STATES: {
          required: ['DOWN', 'OFF'],
          properties: {
            DOWN: { type: 'array', items: { type: 'number' } },
            OK: { type: 'array', items: { type: 'number' } },
          },
        },
      },
    },
  },
});

const STATES = {
  GOOD_SERVICE: 'Good service',
  MINOR_DELAYS: 'Minor delays',
  SEVERE_DELAYS: 'Severe delays',
  SPECIAL_SERVICE: 'Special service',
};

const GREATER_ANGLIA = 'Greater Anglia';
const TFL_RAIL = 'TfL Rail';

const lastStates = {
  [GREATER_ANGLIA]: STATES.GOOD_SERVICE,
  [TFL_RAIL]: STATES.GOOD_SERVICE,
};

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
  log.info('Reasons: ' + results);
  return results;
};

const checkDelays = async (lineName) => {
  const url = 'http://www.nationalrail.co.uk/service_disruptions/indicator.aspx';
  const { body } = await requestAsync(url);
  const stateNow = extract(body, [`${lineName}</td>`, '<td>'], '</td>').trim();
  log.info(`${lineName}: \'${stateNow}\'`);

  // If it's changed, and not OK
  if ((stateNow != lastStates[lineName]) && (stateNow !== STATES.GOOD_SERVICE)) {
    const reasons = await checkReasons(lineName);
    const message = `${stateNow.toUpperCase()}:\n${lineName}.\nReason: ${reasons || ''}`;
    fcm.post('Monitor', 'monitor', message);
    lastStates[lineName] = stateNow;
  }

  return stateNow.includes(STATES.GOOD_SERVICE) || stateNow.includes(STATES.SPECIAL_SERVICE);
};

module.exports = async (args) => {
  if (sleep.sleeping()) {
    return;
  }

  try {
    // TODO: Configurable service lines in ARGS
    // const gaOk = await checkDelays(GREATER_ANGLIA);
    const tflOk = await checkDelays(TFL_RAIL);
    display.setLed(
      args.LED,
      (/*gaOk && */tflOk) ? config.OPTIONS.LED_STATES.OK : config.OPTIONS.LED_STATES.DOWN
    );
  } catch(e) {
    log.error(e);
    fcm.post('Monitor', 'monitor', `Error checking delays: ${e.message}`);
    display.setLed(args.LED, config.OPTIONS.LED_STATES.DOWN);
  }
};
