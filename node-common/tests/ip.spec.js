const { expect } = require('chai');
const ip = require('../src/modules/ip');

describe('ip.js', () => {
  it('should return device\'s local IP address', async () => {
    const address = await ip.getLocal();

    expect(address).to.be.a('string');
  });

  it('should return device\'s public IP address', async () => {
    const address = await ip.getPublic();

    expect(address).to.be.a('string');
  });
});
