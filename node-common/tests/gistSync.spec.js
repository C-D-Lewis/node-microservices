const { expect } = require('chai');
const gistSync = require('../src/modules/gistSync.js');

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
