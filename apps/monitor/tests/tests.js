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
      const result = await testing.sendConduitPacket({ to: 'monitor', topic: 'getMetricToday', message: { name: 'temp' } });

      expect(result.status).to.equal(200);
      expect(result.message).to.be.an('array');

      const point = result.message.pop();
      expect(point.timestamp).to.be.a('number');
      expect(point.dateTime).to.be.a('string');
      expect(point.value).to.equal(23);
    });
  });
});
