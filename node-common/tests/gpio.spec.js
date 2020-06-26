const { expect } = require('chai');
const gpio = require('../src/modules/gpio');

describe('gpio.js', () => {
  it('should set', () => {
    const result = gpio.set(23, false);
    console.log(result);
  });
});
