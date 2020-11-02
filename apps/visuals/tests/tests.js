const { expect } = require('chai');
const { testing } = require('../src/node-common')(['testing']);

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testing.sendConduitPacket({ to: 'visuals', topic: 'status' });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: setPixel', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'setPixel',
        message: {
          '0': [10, 20, 30],
          '1': [30, 50, 60],
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: setAll', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'setAll',
        message: { all: [64,64,64] },
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: blink', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'blink',
        message: {
          '0': [10, 20, 30],
          '1': [30, 50, 60],
        }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  // TODO: Add new tests for added newer APIs
});
