const { expect } = require('chai');
const ip = require('../src/modules/ip.js');

describe('ip.js', () => {
  it('should return local device\'s IP address', async () => {
    const address = await ip.get();

    expect(address).to.be.a('string');
  });
});
