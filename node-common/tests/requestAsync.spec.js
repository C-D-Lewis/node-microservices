const { expect } = require('chai');
const fetch = require('../src/modules/fetch');

describe('fetch.js', () => {
  it('should perform asynchronous requests', async () => {
    const { status, body } = await fetch({ url: 'https://google.com' });

    expect(status).to.equal(200);
    expect(body).to.contain('Google');
  });
});
