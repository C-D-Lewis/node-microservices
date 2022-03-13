// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { fetchRecordData } = require('../src/modules/ipMonitor');

describe('Tests', () => {
  describe('Polaris', () => {
    it('should fetch Route53 record data', async () => {
      const data = await fetchRecordData('localhost');

      expect(data.currentIp).to.have.length.greaterThan(1);
      expect(data.hostedZoneId).to.have.length.greaterThan(1);
      expect(data.recordFullName).to.have.length.greaterThan(1);
    });
  });
});
