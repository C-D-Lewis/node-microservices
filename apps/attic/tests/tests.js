// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

const TEST_APP = 'TestApp';
const TEST_KEY = 'TestKey';
const TEST_VALUE = Math.round(Math.random() * 100);

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'atticTests' });
  });

  describe('Bifrost topic: status', () => {
    it('should return 200 / OK', async () => {
      const { content } = await bifrost.send({ toApp: 'attic', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: set', () => {
    it('should return 200 / OK', async () => {
      const { content } = await bifrost.send({
        toApp: 'attic',
        topic: 'set',
        message: {
          app: TEST_APP,
          key: TEST_KEY,
          value: TEST_VALUE,
        },
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: get', () => {
    it('should return 200 / TEST_VALUE', async () => {
      const {
        app, key, value, timestamp,
      } = await bifrost.send({
        toApp: 'attic',
        topic: 'get',
        message: {
          app: 'TestApp',
          key: 'TestKey',
        },
      });

      expect(app).to.equal(TEST_APP);
      expect(key).to.equal(TEST_KEY);
      expect(value).to.equal(TEST_VALUE);
      expect(timestamp).to.be.a('number');
    });
  });

  describe('Bifrost topic: increment', () => {
    it('should return 200 / OK, then return 200 / TEST_VALUE + 1', async () => {
      let response = await bifrost.send({
        toApp: 'attic',
        topic: 'increment',
        message: {
          app: TEST_APP,
          key: TEST_KEY,
          value: TEST_VALUE,
        },
      });

      expect(response.content).to.equal('OK');

      response = await bifrost.send({
        toApp: 'attic',
        topic: 'get',
        message: {
          app: TEST_APP,
          key: TEST_KEY,
        },
      });

      expect(response.app).to.equal(TEST_APP);
      expect(response.key).to.equal(TEST_KEY);
      expect(response.value).to.equal(TEST_VALUE + 1);
      expect(response.timestamp).to.be.a('number');
    });
  });
});
