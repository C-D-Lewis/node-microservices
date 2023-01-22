// eslint-disable-next-line import/no-extraneous-dependencies
const { expect } = require('chai');
const { bifrost } = require('../src/node-common')(['bifrost']);

const {
  config, requestAsync,
} = require('../src/node-common')(['config', 'requestAsync']);

/** Test webhook with packet */
const TEST_WEBHOOK = {
  url: `/testWebhook${Date.now()}`,
  // TODO: Re-introduce relay
  // packet: { to: 'attic', topic: 'webhookReceived' },
};

describe('API', () => {
  before(async () => {
    await bifrost.connect({ appName: 'conciergeTests' });
  });

  after(bifrost.disconnect);

  describe('Bifrost topic: status', () => {
    it('should return OK', async () => {
      const { content } = await bifrost.send({ to: 'concierge', topic: 'status' });

      expect(content).to.equal('OK');
    });
  });

  describe('Bifrost topic: add', () => {
    it('should return Created', async () => {
      const { content } = await bifrost.send({
        to: 'concierge',
        topic: 'add',
        message: TEST_WEBHOOK,
      });

      expect(content).to.equal('Created');
    });
  });

  describe('Hit TEST_WEBHOOK', () => {
    it('should return OK', async () => {
      const url = `http://localhost:${config.SERVER.PORT}${TEST_WEBHOOK.url}`;
      const data = await requestAsync({ url, method: 'POST' });

      expect(data.response.statusCode).to.equal(200);
      expect(data.body).to.contain('OK');
    });
  });

  describe('Bifrost topic: remove', () => {
    it('should return Removed', async () => {
      const { content } = await bifrost.send({
        to: 'concierge',
        topic: 'remove',
        message: TEST_WEBHOOK,
      });

      expect(content).to.equal('Removed');
    });
  });

  describe('Webhook is actually removed', () => {
    it('should return Not Found', async () => {
      try {
        await bifrost.send({
          to: 'concierge',
          topic: 'remove',
          message: TEST_WEBHOOK,
        });
      } catch (e) {
        expect(e.message).to.equal('Not Found');
      }
    });
  });

  describe('Miss TEST_WEBHOOK', () => {
    it('should return Not Found', async () => {
      const url = `http://localhost:${config.SERVER.PORT}${TEST_WEBHOOK.url}`;
      const data = await requestAsync({ url, method: 'POST' });

      expect(data.response.statusCode).to.equal(404);
      expect(data.body).to.contain('No hook found');
    });
  });
});
