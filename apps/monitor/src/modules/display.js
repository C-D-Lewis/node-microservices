/**
 * LEDs & text display adapter. Remember to configure led-server USE_HARDWARE correctly
 */

const {
  conduit,
} = require('@chris-lewis/node-common')(['conduit']);

const setLed = async (index, rgb) => {
  return conduit.send({ to: 'LedServer', topic: 'setPixel', message: { [index]: rgb } });
};

const setAllLeds = async (rgb) => {
  return conduit.send({ to: 'LedServer', topic: 'setAll', message: { all: rgb } });
};

const setText = async (lines, text) => {
  return conduit.send({ to: 'LedServer', topic: 'setText', message: { lines } });
};

module.exports = {
  setLed,
  setAllLeds,
  setText,
};
