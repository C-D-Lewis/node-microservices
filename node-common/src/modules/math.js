/**
 * Generate a random integer within a range.
 *
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number}
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

module.exports = {
  randomInt,
};
