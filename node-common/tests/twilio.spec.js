const { expect } = require('chai');
const twilio = require('../src/modules/twilio');

describe('twilio.js', () => {
  it('should send an SMS message if configured', async () => {
    // Disabled until a Twilio Sender is purchased
    return;

    const success = await twilio.sendSmsNotification('Test Message');

    expect(success).to.equal(true);
  });
});
