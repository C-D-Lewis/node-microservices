const { conduit } = require('../node-common')(['conduit']);

/**
 * Set an LED to a color.
 *
 * @param {number} index - LED index.
 * @param {Array<number>} rgb - Red, green, blue values.
 * @returns {Promise<object>} Conduit response.
 */
const setLed = async (index, rgb) => conduit.send({ to: 'visuals', topic: 'setPixel', message: { [index]: rgb } });

/**
 * Set all LEDs to a color.
 *
 * @param {Array<number>} rgb - Red, green, blue values.
 * @returns {Promise<object>} Conduit response.
 */
const setAllLeds = async (rgb) => conduit.send({ to: 'visuals', topic: 'setAll', message: { all: rgb } });

/**
 * Set text lines.
 *
 * @param {Array<string>} lines - Text lines to show.
 * @returns {Promise<object>} Conduit response.
 */
const setText = async (lines) => conduit.send({ to: 'visuals', topic: 'setText', message: { lines } });

module.exports = {
  setLed,
  setAllLeds,
  setText,
};
