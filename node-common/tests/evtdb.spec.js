const { expect } = require('chai');
const evtdb = require('../src/modules/evtdb');

describe('evtdb.js', () => {
  it('should use valid config values', async () => {
    await evtdb.init();
  });

  it('should set a value', async () => {
    const res = await evtdb.set('foo', 'bar');

    expect(res[0].value).to.equal('bar');
  });

  it('should check a value exists', async () => {
    const exists = await evtdb.exists('foo');

    expect(exists).to.equal(true);
  });

  it('should check a value does not exists', async () => {
    const exists = await evtdb.exists('bad');

    expect(exists).to.equal(false);
  });
});
