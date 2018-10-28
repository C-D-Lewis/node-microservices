const { expect } = require('chai');

const {
  config, testBed
} = require('@chris-lewis/node-common')(['config', 'testBed']);

const TEST_APP = 'TestApp';
const TEST_KEY = 'TestKey';
const TEST_VALUE = Math.round(Math.random() * 100);

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({ to: 'Attic', topic: 'status' });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: set', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'Attic',
        topic: 'set',
        message: {
          app: TEST_APP,
          key: TEST_KEY,
          value: TEST_VALUE
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: get', () => {
    it('should return 200 / TEST_VALUE', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'Attic',
        topic: 'get',
        message: {
          app: 'TestApp',
          key: 'TestKey'
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.app).to.equal(TEST_APP);
      expect(response.message.key).to.equal(TEST_KEY);
      expect(response.message.value).to.equal(TEST_VALUE);
      expect(response.message.timestamp).to.be.a('number');
    });
  });

  describe('Conduit topic: increment', () => {
    it('should return 200 / OK, then return 200 / TEST_VALUE + 1', async () => {
      let response = await testBed.sendConduitPacket({
        to: 'Attic',
        topic: 'increment',
        message: {
          app: TEST_APP,
          key: TEST_KEY,
          value: TEST_VALUE
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');

      response = await testBed.sendConduitPacket({
        to: 'Attic',
        topic: 'get',
        message: {
          app: TEST_APP,
          key: TEST_KEY
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.app).to.equal(TEST_APP);
      expect(response.message.key).to.equal(TEST_KEY);
      expect(response.message.value).to.equal(TEST_VALUE + 1);
      expect(response.message.timestamp).to.be.a('number');
    });
  });
});
