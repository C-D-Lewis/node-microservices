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

  describe('Conduit topic: setAll', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals',
        topic: 'setAll',
        message: { all: [64, 64, 64] },
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: setPixel', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals',
        topic: 'setPixel',
        message: {
          0: [10, 20, 30],
          1: [30, 50, 60],
        },
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: blink', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals',
        topic: 'blink',
        message: {
          0: [10, 20, 30],
          1: [30, 50, 60],
        },
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: state', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'state',
      });

      expect(response.status).to.equal(200);
      expect(response.message.leds).to.be.an('array');
      expect(response.message.leds).to.have.length.gte(1);
    });
  });

  describe('Conduit topic: fadeAll', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals',
        topic: 'fadeAll',
        message: { to: [64, 64, 64] },
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: off', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'off',
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: demo', () => {
    it('should return 200 / OK', async () => {
      const response = await testing.sendConduitPacket({
        to: 'visuals', topic: 'demo',
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');
    });
  });

  if (!process.env.DOCKER_TEST) {
    // Requires pre-authorization with remote concierge, and something playing
    describe('Conduit topic: spotify', () => {
      it('should return 200 / OK', async () => {
        const response = await testing.sendConduitPacket({
          to: 'visuals', topic: 'spotify',
        });

        expect(response.status).to.equal(200);
        expect(response.message.content).to.be.an('array');
        expect(response.message.content).to.have.length(3);
      });
    });
  }
});
