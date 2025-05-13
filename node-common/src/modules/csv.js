const fs = require('fs');
const log = require('./log');

/**
 * Append a row to a CSV file.
 *
 * @param {string} filePath - Path to the CSV file.
 * @param {string[]} headings - CSV headings to use.
 * @param {string[]} row - Row values.
 */
const appendRow = async (filePath, headings, row) => new Promise((resolve) => {
  // Use append mode
  let stream;

  // New file, add headers too
  if (!fs.existsSync(filePath)) {
    stream = fs.createWriteStream(filePath, { flags: 'w' });
    stream.on('finish', () => {
      log.debug(`csv: ${filePath} (began file with headers)`);
      resolve();
    });
    stream.end(`${headings.map((h) => `"${h}"`).join(',')}\n`);
    stream.close();
    return;
  }

  // Write CSV file in append mode
  stream = fs.createWriteStream(filePath, { flags: 'a' });
  stream.on('finish', () => {
    log.debug(`csv: ${filePath} => ${row.join(',')}`);
    resolve();
  });
  stream.end(`${row.map((r) => `"${r}"`).join(',')}\n`);
  stream.close();
});

module.exports = {
  appendRow,
};
