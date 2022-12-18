const { expect } = require('chai');
const config = require('../src/modules/config');

describe('config.js', () => {
  it('should load the config file', () => {
    expect(config).to.be.an('object');
  });

  it('should contain data from the config file', () => {
    expect(config.LOG).to.be.an('object');
  });

  it('should allow modules to require keys', () => {
    expect(config.withSchema).to.be.a('function');

    const { LOG } = config.withSchema('config.spec.js', { required: ['LOG'] });
    expect(LOG).to.be.an('object');
  });

  it('should return the install path', () => {
    expect(config.getInstallPath()).to.include('node-common');
  });
});
