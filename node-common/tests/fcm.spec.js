const { expect } = require('chai');
const fcm = require('../src/modules/fcm.js');

describe('fcm.js', () => {
  it('should post a message to FCM', async () => {
    await fcm.post('Test Message', 'global', { foo: 'bar' });
  });
});
