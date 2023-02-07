// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'visualsTests' });
  });

  after(bifrost.disconnect);

  describe('Bifrost topic: status', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({ to: 'visuals', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: setAll', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals',
        topic: 'setAll',
        message: { all: [64, 64, 64] },
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: setPixel', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals',
        topic: 'setPixel',
        message: {
          0: [10, 20, 30],
          1: [30, 50, 60],
        },
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: blink', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals',
        topic: 'blink',
        message: {
          0: [10, 20, 30],
          1: [30, 50, 60],
        },
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: state', () => {
    it('should return OK', async () => {
      const { leds } = await bifrost.send({
        to: 'visuals', topic: 'state',
      });

      expect(leds).to.be.an('array');
      expect(leds).to.have.length.gte(1);
    });
  });

  describe('Bifrost topic: fadeAll', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals',
        topic: 'fadeAll',
        message: { to: [64, 64, 64] },
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: off', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals', topic: 'off',
      });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: demo', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals', topic: 'demo',
      });

      expect(content).to.equal('OK');
    });
  });

  // Requires pre-authorization with remote concierge, and something playing
  describe('Bifrost topic: spotify', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({
        to: 'visuals', topic: 'spotify',
      });

      expect(content).to.be.an('array');
      expect(content).to.have.length(3);
    });
  });
});
