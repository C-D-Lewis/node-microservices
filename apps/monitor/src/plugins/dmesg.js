const { execSync } = require('child_process');
const { createAlert } = require('../modules/alert');
const { log } = require('../node-common')(['log']);

/**
 * @typedef {object} DmesgError
 * @property {string} time - The timestamp of the error.
 * @property {string} message - The error message.
 * @property {string} line - The full original line from dmesg.
 */

let alert;
const seenErrors = [];

/**
 * Returns a list of errors with { time, message } objects.
 *
 * @param {string[]} lines - Array of dmesg lines to process.
 * @returns {DmesgError[]} - Array of error objects.
 */
const getErrors = (lines) => lines.reduce((acc, line) => {
  const time = line.split(']')[0].replace('[', '')?.trim();
  const message = line.split(']')[1]?.trim();
  return [
    ...acc,
    { time, message, line },
  ];
}, []);

/**
 * Check dmesg for errors or failures.
 * E.g:
 *   [    3.164494] ACPI Error: AE_ALREADY_EXISTS, CreateBufferField failure (20230628/dswload2-477)
 */
module.exports = async () => {
  if (alert) {
    await alert.test();
    return;
  }

  alert = createAlert(
    'dmesg',
    async () => {
      const lines = execSync('dmesg').toString().split('\n');
      const newErrors = getErrors(lines)
        .filter((p) => !!p.message)
        .filter((p) => ['error', 'fail'].some((q) => p.message.includes(q)))
        .filter((p) => !seenErrors.find((e) => e.time === p.time));

      // Remember new errors that were not already seen
      newErrors.forEach((p) => seenErrors.push(p));

      log.debug(`new dmesg errors found: ${newErrors.length}`);
      return newErrors.length ? newErrors : undefined;
    },
    (newErrors) => (newErrors
      ? `dmesg errors found!\n\n${newErrors.map((p) => p.line).join('\n')}`
      : 'No dmesg errors found.'),
  );

  await alert.test();
};
