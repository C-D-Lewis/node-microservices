const { expect } = require('chai');
const gistSync = require('../src/modules/gistSync');

// Intended to work with https://gist.github.com/C-D-Lewis/6fa0a01d83dc170c480081f96b2955cd

describe('gistSync.js', () => {
  it('should init the gist repository', () => {
    gistSync.init();
  });

  it('should sync with the gist repository', () => {
    gistSync.sync();
  });

  it('should return file data', () => {
    const file = gistSync.getFile('attic-db.json');

    expect(file).to.be.an('object');
  });
});
