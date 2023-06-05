const { expect } = require('chai');
const config = require('../src/modules/config');

describe('config.js', () => {
  it('should contain data from the config file', () => {
    const { DB } = config.get(['DB']);

    expect(DB).to.be.an('object');
  });

  it('should allow modules to require keys', () => {
    expect(config.addPartialSchema).to.be.a('function');

    config.addPartialSchema({
      required: ['DB'],
      properties: {
        DB: {
          required: ['FILE'],
          properties: {
            FILE: { type: 'string' },
          },
        },
      },
    });
  });

  it('should return the install path', () => {
    expect(config.getInstallPath()).to.include('node-common');
  });
});
