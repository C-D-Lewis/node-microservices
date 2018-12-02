const { expect } = require('chai');
const eventBus = require('../src/modules/eventBus.js');

describe('eventBus.js', () => {
  const handler = params => {};

  it('should allow subscription', () => {
    eventBus.subscribe('foo', handler);
  });

  it('should allow unsubscription', () => {
    eventBus.unsubscribe('foo', handler);
  });

  it('should broadcast an event with params', (done) => {
    eventBus.subscribe('foo', (params) => {
      expect(params.bar).to.equal(true);
      done();
    });

    eventBus.broadcast('foo', { bar: true });
  });
});
