const {
  fetch, log, extract,
} = require('../node-common')(['fetch', 'config', 'log', 'extract']);
const { createAlarm } = require('../modules/alarm');

/** TfL API modes to query */
const TFL_MODES = ['tube', 'elizabeth-line'];
/** National Rail operators to check */
const NR_OPERATORS = ['Greater Anglia'];
/** TfL lines to check */
const TFL_LINES = ['jubilee'];
/** Hours to alarm */
const HOURS = [7, 22];
/** String to ignore */
const IGNORE = [
  'Ely', 'Cambridge', 'Manningtree', 'Chingford', 'Seven Sisters', 'Tottenham Hale', 'resume',
  'Lowestoft', 'Diss', 'Stanstead', 'Hackney', 'Southminster', 'Wickford',
];
/** Fetch fixed options */
const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  },
};

let nrAlarm;
let tflAlarm;

/**
 * Fetch rought <li> list of distruptions from National Rail.
 *
 * @returns {string[]} <li> list.
 */
const fetchNationalRailList = async () => {
  const url = 'https://www.nationalrail.co.uk/status-and-disruptions/?mode=train-operator-status';
  const { body } = await fetch(url, FETCH_OPTS);
  return extract(body, ['Disruptions on these'], 'Good service for all').split('<li>');
};

/**
 * Fetch TfL API data.
 *
 * @returns {object[]} List of API objects.
 */
const fetchTflList = async () => {
  const url = `https://api.tfl.gov.uk/line/mode/${TFL_MODES.join(',')}/status`;
  const { data } = await fetch(url);
  return data;
};

/**
 * Check for delays on a line.
 *
 * @param {string[]} data - List of <li> from the page.
 * @param {string} operatorName - Line name to check.
 * @returns {boolean} true if the line is OK.
 */
const checkNationalRailLine = (data, operatorName) => {
  const found = data.find((p) => p.includes(operatorName));
  if (!found) return undefined;

  // Get the first label which seems to contain the description
  const description = extract(found, ['aria-label="'], '"');

  // Check for things we don't care about
  if (description && IGNORE.some((p) => description.includes(p))) {
    log.debug(`Found some ignore text, skipping: ${description}`);
    return undefined;
  }

  // If mentioned at all, probably of interest
  return found ? (description || operatorName) : undefined;
};

/**
 * Check a TfL line.
 *
 * @param {object[]} data - API lines objects.
 * @param {string} lineId - ID of the line to check.
 * @returns {string|undefined} Incident notice for this line if found.
 */
const checkTflLine = (data, lineId) => {
  const line = data.find((p) => p.id === lineId);
  const disrupted = !line?.lineStatuses[0]?.statusSeverityDescription.includes('Good');
  const reason = line?.lineStatuses[0].reason;

  // Check for things we don't care about
  if (reason && IGNORE.some((p) => reason.includes(p))) {
    log.debug(`Found some ignore text, skipping: ${reason}`);
    return undefined;
  }

  return disrupted ? reason : undefined;
};

/**
 * Check rail services for delays.
 */
module.exports = async () => {
  // If not during hours, skip
  const hour = new Date().getHours();
  const [start, end] = HOURS;
  if (hour < start || hour > end) {
    log.debug(`Not in active hours, skipping: ${hour}`);
    return;
  }

  if (nrAlarm && tflAlarm) {
    await nrAlarm.test();
    await tflAlarm.test();
    return;
  }

  nrAlarm = createAlarm({
    name: 'delaysNr',
    notifyOnRecover: false,
    testCb: async () => {
      const data = await fetchNationalRailList();

      const incidents = NR_OPERATORS
        .map((p) => checkNationalRailLine(data, p))
        .filter((p) => !!p);
      log.debug(JSON.stringify({ incidents }, null, 2));

      let text = '';
      if (incidents.length) {
        text += `Rail:\n${incidents.join('\n')}\n`;
      }

      return incidents.length !== 0 ? text : undefined;
    },
    messageCb: (text) => (text
      ? `National Rail incidents!\n\n${text}`
      : 'No configured lines have incidents reported.'),
  });

  tflAlarm = createAlarm({
    name: 'delaysTfl',
    notifyOnRecover: false,
    testCb: async () => {
      const data = await fetchTflList();

      const incidents = TFL_LINES
        .map((p) => checkTflLine(data, p))
        .filter((p) => !!p);
      log.debug(JSON.stringify({ incidents }, null, 2));

      let text = '';
      if (incidents.length) {
        text += `TfL:\n${incidents.join('\n')}\n`;
      }

      return incidents.length === 0 ? text : undefined;
    },
    messageCb: (text) => (text
      ? `TfL incidents!\n\n${text}`
      : 'No configured lines have incidents reported.'),
  });

  await nrAlarm.test();
  await tflAlarm.test();
};
