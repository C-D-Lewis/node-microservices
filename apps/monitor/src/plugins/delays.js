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
const HOURS = [7, 19];
/** String to ignore */
const IGNORE = ['Ely', 'Cambridge', 'Manningtree'];
/** Fetch fixed options */
const FETCH_OPTS = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  },
};

let alert;
let latestText = '';

/**
 * Check for delays on a line.
 *
 * @param {string} lineName - Line name to check.
 * @returns {boolean} true if the line is OK.
 */
const checkNationalRail = async (lineName) => {
  const url = 'https://www.nationalrail.co.uk/status-and-disruptions/?mode=train-operator-status';
  const { body } = await fetch(url, FETCH_OPTS);

  // Find first mention of operator in disruption section
  const disruptions = extract(body, ['Disruptions on these'], 'Good service for all').split('<li>');
  const found = disruptions.find((p) => p.includes(lineName));
  if (!found) return undefined;

  // Get the first label which seems to contain the description
  const description = extract(found, ['aria-label="'], '"');

  // If mentioned at all, probably of interest
  return found ? (description || lineName) : undefined;
};

/**
 * Check a TfL line.
 *
 * @param {string} lineId - ID of the line to check.
 */
const checkTflStatus = async (lineId) => {
  const url = `https://api.tfl.gov.uk/line/mode/${TFL_MODES.join(',')}/status`;
  const { data } = await fetch(url);

  const line = data.find((p) => p.id === lineId);
  const disrupted = !line?.lineStatuses[0]?.statusSeverityDescription.includes('Good');
  return disrupted ? lineId : undefined;
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
      const rail = (await Promise.all(OPERATORS.map(checkNationalRail)))
        .filter((p) => !!p);
      const tfl = (await Promise.all(TUBE_LINES.map(checkTflStatus)))
        .filter((p) => !!p);
      log.debug({ rail, tfl });

      latestText = '';
      if (rail.length) {
        latestText += `Rail:
${rail.join('\n')}
`;
      }
      if (tfl.length) {
        latestText += `TfL:
${tfl.join('\n')}
`;
      }

      return !(rail.length || tfl.length);
    },
    (success) => (success
      ? 'No configured lines have incidents reported.'
      : `Rail incidents!\n\n${latestText}`),
  );

  await alert.test();
};
