/**
 * LEDs & text display adapter. Remember to configure led-server USE_HARDWARE correctly
 */

const { conduit, config } = require('../node-common')(['conduit', 'config']);

const setLed = async (index, rgb) => conduit.send({ to: 'visuals', topic: 'setPixel', message: { [index]: rgb } });

const setAllLeds = async (rgb) => conduit.send({ to: 'visuals', topic: 'setAll', message: { all: rgb } });

const setText = async (lines) => conduit.send({ to: 'visuals', topic: 'setText', message: { lines } });

const setBoth = (data) => {
  const [ledData, textData] = data;
  if (config.DISPLAY_DRIVER === 'textDisplay') {
    return setText(textData.line, textData.text);
  }

  if (config.DISPLAY_DRIVER === 'leds') {
    return setLed(ledData.index, ledData.rgb);
  }
};

module.exports = {
  setLed,
  setAllLeds,
  setText,
  setBoth,
};
