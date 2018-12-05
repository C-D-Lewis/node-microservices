const { expect } = require('chai');
const requestAsync = require('../src/modules/requestAsync');

describe('requestAsync.js', () => {
  it('should perform asynchronous request', async () => {
    const { response } = await requestAsync({ url: 'https://example.com' });

    expect(response.statusCode).to.equal(200);
  });
});
