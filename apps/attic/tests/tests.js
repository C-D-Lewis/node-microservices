const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

const TEST_APP = 'TestApp';
const TEST_KEY = 'TestKey';
const TEST_VALUE = Math.round(Math.random() * 100);

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'atticTests' });
  });

  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const { content } = await bifrost.send({ toApp: 'attic', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Conduit topic: set', () => {
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

  // describe('Conduit topic: get', () => {
  //   it('should return 200 / TEST_VALUE', async () => {
  //     const response = await testing.sendConduitPacket({
  //       to: 'attic',
  //       topic: 'get',
  //       message: {
  //         app: 'TestApp',
  //         key: 'TestKey'
  //       }
  //     });

  //     expect(response.app).to.equal(TEST_APP);
  //     expect(response.key).to.equal(TEST_KEY);
  //     expect(response.value).to.equal(TEST_VALUE);
  //     expect(response.timestamp).to.be.a('number');
  //   });
  // });

  // describe('Conduit topic: increment', () => {
  //   it('should return 200 / OK, then return 200 / TEST_VALUE + 1', async () => {
  //     let response = await testing.sendConduitPacket({
  //       to: 'attic',
  //       topic: 'increment',
  //       message: {
  //         app: TEST_APP,
  //         key: TEST_KEY,
  //         value: TEST_VALUE
  //       }
  //     });

  //     expect(response.content).to.equal('OK');

  //     response = await testing.sendConduitPacket({
  //       to: 'attic',
  //       topic: 'get',
  //       message: {
  //         app: TEST_APP,
  //         key: TEST_KEY
  //       }
  //     });

  //     expect(response.app).to.equal(TEST_APP);
  //     expect(response.key).to.equal(TEST_KEY);
  //     expect(response.value).to.equal(TEST_VALUE + 1);
  //     expect(response.timestamp).to.be.a('number');
  //   });
  // });
});
