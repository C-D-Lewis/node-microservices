const { expect } = require('chai');
const db = require('../src/modules/db');

describe('db.js', () => {
  it('should set a value', () => {
    db.set('foo', 'bar');
  });

  it('should read a value', () => {
    const value = db.get('foo');

    expect(value).to.equal('bar');
  });

  it('should get the whole table', () => {
    const table = db.getTable();

    expect(table.foo).to.equal('bar');
  });

  it('should check a value exists', () => {
    expect(db.exists('foo')).to.equal(true);
    expect(db.exists('bad')).to.equal(false);
  });

  it('should delete a value', () => {
    db.delete('foo');

    expect(db.exists('foo')).to.equal(false);
  });
});
