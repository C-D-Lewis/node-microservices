const { expect } = require('chai');
const attic = require('../src/modules/attic');

describe('attic.js', () => {
  before(() => attic.setAppName('node-common'));

  it('should set a value in Attic service', async () => {
    const res = await attic.set('foo', 'bar');

    expect(res.status).to.equal(200);
  });

  it('should get a value from Attic service', async () => {
    const res = await attic.get('foo');

    expect(res).to.equal('bar');
  });

  it('should check a value exists', async () => {
    const res = await attic.exists('foo');

    expect(res).to.equal(true);
  });

  it('should fail to find a non-existent value', async () => {
    const res = await attic.exists('lego');

    expect(res).to.equal(false);
  });
});
