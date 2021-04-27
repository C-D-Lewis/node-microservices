const { expect } = require('chai');
const twilio = require('../src/modules/twilio');

describe('twilio.js', () => {
  it.only('should send an SMS message if configured', async () => {
    const success = await twilio.sendSmsNotification('Test Message');

    expect(success).to.equal(true);
  });
});
