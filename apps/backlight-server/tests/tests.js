const { expect } = require('chai');

const {
  config, testBed
} = require('@chris-lewis/node-common')(['config', 'testBed']);

const SLEEP_MS = 500;

describe('API', () => {
  describe('Conduit topic: status', () => {
    it('should return 200 / OK', async () => {
      const result = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'status'
      });

      expect(result.status).to.equal(200);
      expect(result.message.content).to.equal('OK');
    });
  });

  describe('Conduit topic: demo', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'demo'
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');

      await testBed.sleep(SLEEP_MS);
    });
  });

  describe('Conduit topic: off', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'off'
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');

      await testBed.sleep(SLEEP_MS);
    });
  });

  describe('Conduit topic: set', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'set',
        message: { all: [64,64,64] }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');

      await testBed.sleep(SLEEP_MS);
    });
  });

  describe('Conduit topic: fade', () => {
    it('should return 200 / OK', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'fade',
        message: { all: [64,64,64] }
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.equal('OK');

      await testBed.sleep(SLEEP_MS);
    });
  });

  describe('Conduit topic: spotify', () => {
    it('should return 200 / [r,g,b]', async () => {
      const response = await testBed.sendConduitPacket({
        to: 'BacklightServer', topic: 'spotify'
      });

      expect(response.status).to.equal(200);
      expect(response.message.content).to.be.an('array');
      expect(response.message.content).to.have.length(3);
    });
  });
});
