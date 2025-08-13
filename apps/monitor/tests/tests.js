const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'status' });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });

    it('should accept metric data', async () => {
      const metrics = { temp: 23, light: 12 };
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'updateMetrics', message: { metrics } });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('success');
    });

    it('should return metric data', async () => {
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'getMetricHistory', message: { name: 'temp' } });

      expect(result.status).to.equal(200);
      expect(result.message).to.be.an('array');

      const [timestamp, value] = result.message.pop();
      expect(timestamp).to.be.a('number');
      expect(value).to.equal(23);
    });

    it('should return metric data for a specific date', async () => {
      const date = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'getMetricHistory', message: { name: 'temp', date } });

      expect(result.status).to.equal(200);
      expect(result.message).to.be.an('array');
      const [timestamp, value] = result.message.pop();
      expect(timestamp).to.be.a('number');
      expect(value).to.equal(23);
    });

    it('should return metric names', async () => {
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'getMetricNames' });

      expect(result.status).to.equal(200);
      expect(result.message).to.be.an('array');
      expect(result.message.length).to.be.greaterThan(1);
    });
  });
});
