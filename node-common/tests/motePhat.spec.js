const { expect } = require('chai');
const motePhat = require('../src/modules/motePhat');

describe('motePhat.js', () => {
  it('should setAll', () => {
    motePhat.setAll([128, 128, 128]);
  });

  it('should set some pixels', () => {
    motePhat.setPixels([[10, 10, 10], [20, 20, 20], [30, 30, 30]]);
  });
});
