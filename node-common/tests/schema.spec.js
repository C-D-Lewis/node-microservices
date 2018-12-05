const { expect } = require('chai');
const schema = require('../src/modules/schema');

describe('schema.js', () => {
  const theSchema = {
    required: ['foo', 'bar'],
    properties: {
      foo: { type: 'string' },
      bar: { type: 'number' },
    },
  };

  it('should validate a schema', () => {
    const instance = {
      foo: 'hello',
      bar: 42,
    };

    expect(schema(instance, theSchema)).to.equal(true);
  });

  it('should flag a non-compliant instance', () => {
    const badInstance = {
      foo: 'string',
      bar: '42',
    };

    expect(schema(badInstance, theSchema)).to.equal(false);
  });
});
