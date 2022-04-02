/** Cell size */
const CELL_SIZE = 12;

/**
 * Pad a string to a given length.
 *
 * @param {string} input - Input string.
 * @param {number} max - Maximum width.
 */
const pad = (input, max = CELL_SIZE) => {
  const str = `${input}`;
  return `${str}${' '.repeat(max - str.length)}`;
};

/**
 * Write a string without newline.
 *
 * @param {string} s - String to print.
 */
const print = (s) => process.stdout.write(s);

/**
 * Print data as a table.
 *
 * @param {Array<string>} headers - Column headers.
 * @param {Array<Array<string>>} rows - Rows with cells.
 */
const printTable = (headers, rows) => {
  const colWidths = [];
  headers.forEach((h, i) => {
    const max = rows.reduce((acc, row) => {
      const rowLength = Array.isArray(row[i]) ? row[i].join(',').length : row[i].length;
      return (rowLength > acc ? rowLength : acc);
    }, 0);
    colWidths[i] = Math.max(max, CELL_SIZE) + 1;
  });

  // Header
  headers.forEach((header, i) => print(pad(header, colWidths[i])));
  print('\n');
  colWidths.forEach((w, i) => {
    print(`${'-'.repeat(w - 1)}`);
    if (i !== colWidths.length - 1) print('|');
  });
  print('\n');

  // Rows
  rows.forEach((row) => {
    row.forEach((cell, i) => print(pad(cell, colWidths[i])));
    print('\n');
  });
};

module.exports = printTable;
