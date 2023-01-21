// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'monitorTests' });
  });

  describe('Bifrost topic: status', () => {
    it('should return 200 / OK', async () => {
      const { content } = await bifrost.send({ to: 'monitor', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Metric API', () => {
    it('should accept metric data', async () => {
      const metrics = { temp: 23, light: 12 };
      const { content } = await bifrost.send({ to: 'monitor', topic: 'updateMetrics', message: { metrics } });

      expect(content).to.equal('success');
    });

    it('should return metric data', async () => {
      const { points } = await bifrost.send({ to: 'monitor', topic: 'getMetricToday', message: { name: 'temp' } });

      expect(points).to.be.an('array');

      const point = points.pop();
      expect(point.timestamp).to.be.a('number');
      expect(point.dateTime).to.be.a('string');
      expect(point.value).to.equal(23);
    });

    it('should return metric names', async () => {
      const { names } = await bifrost.send({ to: 'monitor', topic: 'getMetricNames' });

      expect(names).to.be.an('array');
      expect(names).to.have.length(2);
    });
  });
});
