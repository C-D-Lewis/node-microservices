const { expect } = require('chai');
const config = require('../src/modules/config');

describe('config.js', () => {
  it('should contain data from the config file', () => {
    const { LOG } = config.get(['LOG']);

    expect(LOG).to.be.an('object');
  });

  it('should allow modules to require keys', () => {
    expect(config.addPartialSchema).to.be.a('function');

    config.addPartialSchema({
      required: ['LOG'],
      properties: {
        LOG: {
          properties: {
            TEST: { type: 'string' },
          },
        },
      },
    });
  });

  it('should return the install path', () => {
    expect(config.getInstallPath()).to.include('node-common');
  });
});
