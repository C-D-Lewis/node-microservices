const { expect } = require('chai');
const extract = require('../src/modules/extract');

describe('extract.js', () => {
  it('should extract using multiple start points', () => {
    const text = 'a quick brow fox jumped over the lazy dog.';
    const res = extract(text, ['quick', 'over'], 'lazy');

    expect(res).to.equal(' the ');
  });
});
