const { expect } = require('chai');
const fs = require('fs');
const csv = require('../src/modules/csv');

const filePath = `${__dirname}/../test.csv`;

before(() => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

describe('csv.js', () => {
  it('should write a new CSV file with headers', async () => {
    const headings = ['Name', 'Age'];
    const row = ['Alice', '30'];

    await csv.appendRow(filePath, headings, row);

    const fileContent = fs.readFileSync(filePath, 'utf8');
    expect(fileContent).to.equal('"Name","Age"\n');
  });

  it('should write a new row to the file', async () => {
    const headings = ['Name', 'Age'];
    const row = ['Alice', '30'];

    await csv.appendRow(filePath, headings, row);

    const fileContent = fs.readFileSync(filePath, 'utf8');
    expect(fileContent).to.equal('"Name","Age"\n"Alice","30"\n');
  });
});
