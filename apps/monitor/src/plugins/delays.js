const {
  fetch, log, extract,
} = require('../node-common')(['fetch', 'config', 'log', 'extract']);
const { createAlert } = require('../modules/alert');

/** TfL API modes to query */
const TFL_MODES = ['tube', 'elizabeth-line'];
/** National Rail operators to check */
const OPERATORS = ['Greater Anglia'];
/** TfL lines to check */
const TUBE_LINES = ['jubilee'];
/** Hours to alert */
const HOURS = [7, 22];
/** String to ignore */
const IGNORE = ['Ely', 'Cambridge', 'Manningtree', 'Chingford', 'Seven Sisters', 'Tottenham Hale'];
/** Fetch fixed options */
const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  },
};

let alert;
let latestText = '';
let latestCount = 0;

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
 * Fetch TfL APi data.
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
 * @param {string[]} list - List of <li> from the page.
 * @param {string} lineName - Line name to check.
 * @returns {boolean} true if the line is OK.
 */
const checkNationalRailLine = (list, lineName) => {
  const found = list.find((p) => p.includes(lineName));
  if (!found) return undefined;

  // Get the first label which seems to contain the description
  const description = extract(found, ['aria-label="'], '"');

  // Check for things we don't care about
  if (description && IGNORE.some((p) => description.includes(p))) {
    log.debug(`Found some ignore text, skipping: ${description}`);
    return undefined;
  }

  // If mentioned at all, probably of interest
  return found ? (description || lineName) : undefined;
};

/**
 * Check a TfL line.
 *
 * @param {object[]} lines - API lines objects.
 * @param {string} lineId - ID of the line to check.
 * @returns {string|undefined} Incident notice for this line if found.
 */
const checkTflLine = (lines, lineId) => {
  const line = lines.find((p) => p.id === lineId);
  const disrupted = !line?.lineStatuses[0]?.statusSeverityDescription.includes('Good');
  return disrupted ? line?.lineStatuses[0].reason : undefined;
};

/**
 * Check rail services for delays.
 */
module.exports = async () => {
  if (alert) {
    await alert.test();
    return;
  }

  alert = createAlert(
    'delays',
    async () => {
      // If not during hours, skip
      const hour = new Date().getHours();
      const [start, end] = HOURS;
      if (hour < start || hour > end) {
        log.debug(`Not in active hours, skipping: ${hour}`);
        return true;
      }

      // Fetch each only once
      const nationalrailList = await fetchNationalRailList();
      const tflList = await fetchTflList();

      const railIncidents = OPERATORS
        .map((p) => checkNationalRailLine(nationalrailList, p))
        .filter((p) => !!p);
      const tflIncidents = TUBE_LINES
        .map((p) => checkTflLine(tflList, p))
        .filter((p) => !!p);
      log.debug(JSON.stringify({ railIncidents, tflIncidents }, null, 2));

      latestText = '';
      if (railIncidents.length) {
        latestText += `Rail:\n${railIncidents.join('\n')}\n`;
      }
      if (tflIncidents.length) {
        latestText += `TfL:\n${tflIncidents.join('\n')}\n`;
      }

      latestCount = railIncidents.length + tflIncidents.length;
      return latestCount === 0;
    },
    (success) => (success
      ? 'No configured lines have incidents reported.'
      : `Rail incidents!\n\n${latestText}`),
  );

  await alert.test();
};
