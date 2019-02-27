/**
 * LEDs & text display adapter. Remember to configure led-server USE_HARDWARE correctly
 */

const {
  conduit, config,
} = require('@chris-lewis/node-common')(['conduit', 'config']);

const setLed = async (index, rgb) => {
  return conduit.send({ to: 'LedServer', topic: 'setPixel', message: { [index]: rgb } });
};

const setAllLeds = async (rgb) => {
  return conduit.send({ to: 'LedServer', topic: 'setAll', message: { all: rgb } });
};

const setText = async (lines, text) => {
  return conduit.send({ to: 'LedServer', topic: 'setText', message: { lines } });
};

const setBoth = (data) => {
  const [ledData, textData] = data;
  if (config.DISPLAY_DRIVER === 'textDisplay') {
    return setText(textData.line, textData.text);
  } else if (config.DISPLAY_DRIVER === 'leds') {
    return setLed(ledData.index, ledData.rgb);
  }
};

module.exports = {
  setLed,
  setAllLeds,
  setText,
  setBoth,
};
