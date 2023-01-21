// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'monitorTests' });
  });

  describe('Bifrost topic: status', () => {
    it('should return 200 / OK', async () => {
      const { message } = await bifrost.send({ to: 'monitor', topic: 'status' });

      expect(message.content).to.equal('OK');
    });
  });

  describe('Metric API', () => {
    it('should accept metric data', async () => {
      const metrics = { temp: 23, light: 12 };
      const { message } = await bifrost.send({ to: 'monitor', topic: 'updateMetrics', message: { metrics } });

      expect(message.content).to.equal('success');
    });

    it('should return metric data', async () => {
      const { message } = await bifrost.send({ to: 'monitor', topic: 'getMetricToday', message: { name: 'temp' } });

      expect(message).to.be.an('array');

      const point = message.pop();
      expect(point.timestamp).to.be.a('number');
      expect(point.dateTime).to.be.a('string');
      expect(point.value).to.equal(23);
    });

    it('should return metric names', async () => {
      const { message } = await bifrost.send({ to: 'monitor', topic: 'getMetricNames' });

      expect(message).to.be.an('array');
      expect(message).to.have.length(2);
    });
  });
});
