const { expect } = require('chai');
const enviro = require('../src/modules/enviro');

describe('enviro.js', () => {
  it('should readAll', () => {
    const data = enviro.readAll();

    expect(data.temperature).to.be.a('number');
    expect(data.pressure).to.be.a('number');
    expect(data.humidity).to.be.a('number');
    expect(data.lux).to.be.a('number');
    expect(data.proximity).to.be.a('number');
  });
});
