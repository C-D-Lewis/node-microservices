const { expect } = require('chai');
const log = require('../src/modules/log');

describe('log.js', () => {
  it('should begin the log', () => {
    log.begin();
  });

  it('should log info', () => {
    log.info('info');
  });

  it('should log debug', () => {
    log.debug('debug');
  });

  it('should log debug', () => {
    log.debug('debug');
  });

  it('should log error', () => {
    log.error('error');
  });

  it('should assert a condition without exiting', () => {
    log.assert(false, 'false is not true');
  });
});
