const { bifrost } = require('../node-common')(['bifrost']);

/**
 * Set an LED to a color.
 *
 * @param {number} index - LED index.
 * @param {Array<number>} rgb - Red, green, blue values.
 * @returns {Promise<object>} bifrost response.
 */
const setLed = async (index, rgb) => bifrost.send({ to: 'visuals', topic: 'setPixel', message: { [index]: rgb } });

/**
 * Set all LEDs to a color.
 *
 * @param {Array<number>} rgb - Red, green, blue values.
 * @returns {Promise<object>} bifrost response.
 */
const setAllLeds = async (rgb) => bifrost.send({ to: 'visuals', topic: 'setAll', message: { all: rgb } });

/**
 * Set text lines.
 *
 * @param {Array<string>} lines - Text lines to show.
 * @returns {Promise<object>} bifrost response.
 */
const setText = async (lines) => bifrost.send({ to: 'visuals', topic: 'setText', message: { lines } });

module.exports = {
  setLed,
  setAllLeds,
  setText,
};
