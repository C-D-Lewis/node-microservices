// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { fetchRecordData } = require('../src/modules/ipMonitor');
const { bifrost } = require('../src/node-common')(['bifrost']);

describe('Tests', () => {
  before(async () => {
    await bifrost.connect({ appName: 'polarisTests' });
  });

  describe('Bifrost topic: status', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({ to: 'polaris', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('ipMonitor', () => {
    it('should fetch Route53 record data', async () => {
      const data = await fetchRecordData('localhost');

      expect(data.currentIp).to.have.length.greaterThan(1);
      expect(data.hostedZoneId).to.have.length.greaterThan(1);
      expect(data.recordFullName).to.have.length.greaterThan(1);
    });
  });
});
