const { expect } = require('chai');
const textDisplay = require('../src/modules/textDisplay');

// Does not test physical hardware unless configured to use it
describe('textDisplay.js', () => {
  it('should set a line of text', () => {
    textDisplay.setLine(0, 'Hello, world!');
  });

  it('should update internal state and make available', () => {
    expect(textDisplay.getLinesState()[0]).to.equal('Hello, world!');
  });

  it ('should set all lines', () => {
    textDisplay.setLines(['hello', 'world', '42']);

    expect(textDisplay.getLinesState()[2]).to.equal('42');
  });

  it('should clear all lines', () => {
    textDisplay.clearLines();
  });

  it('should return number of lines', () => {
    expect(textDisplay.getNumLines()).to.be.above(3);
  });
});
