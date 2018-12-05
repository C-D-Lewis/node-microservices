const { expect } = require('chai');
const leds = require('../src/modules/leds');


// Does not test physical hardware unless configured to use it
describe('leds.js', () => {
  it('should set an LED', () => {
    leds.set(0, [10, 10, 10]);
  });

  it('should update internal state and make available', () => {
    expect(leds.getState().length).to.equal(1);
  });

  it ('should set all LEDs', () => {
    leds.setAll([128, 128, 128]);

    expect(leds.getState().length).to.equal(8);
  });

  it('should blink an LED', () => {
    leds.blink(0, [255, 255, 255]);
  });

  it('should return number of LEDs', () => {
    expect(leds.getNumLEDs()).to.equal(8);
  });
});
