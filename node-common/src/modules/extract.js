/**
 * Extract text from a larger block with locator strings.
 *
 * @param {string} text - Text to search through.
 * @param {Array<string>} befores - Sequential samples to find before the text to extract.
 * @param {string} after - Sample immediately after text to extract.
 * @returns {string} Extracted text.
 */
module.exports = (text, befores, after) => {
  let copy = `${text}`;

  befores.forEach((item) => {
    const start = copy.indexOf(item);
    if (start === -1) throw new Error(`Unable to find ${item} when extracting`);

    copy = copy.substring(start);
  });

  copy = copy.substring(befores[befores.length - 1].length);
  return copy.substring(0, copy.indexOf(after));
};
