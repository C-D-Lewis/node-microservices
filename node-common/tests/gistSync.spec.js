const { expect } = require('chai');
const gistSync = require('../src/modules/gistSync');

describe('gistSync.js', () => {
  // TODO: Asks for username
  if (process.env.DOCKER_TEST) return;

  it('should init the gist repository', () => {
    gistSync.init();
  });

  it('should sync with the gist repository', () => {
    gistSync.sync();
  });

  it('should return file data', () => {
    const file = gistSync.getFile('file.json');

    expect(file).to.be.an('object');
  });
});
