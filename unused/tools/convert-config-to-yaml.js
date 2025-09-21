const yaml = require('yaml');
const { readFileSync, writeFileSync } = require('fs');

const [input, output] = process.argv.slice(2);

// Need to update everywhere that consumes config...
// const lowercaseKeys = (obj) => {
//   if (Array.isArray(obj)) return obj.map(lowercaseKeys);

//   if (obj !== null && typeof obj === 'object') {
//     return Object.entries(obj).reduce((acc, [key, value]) => {
//       acc[key.toLowerCase()] = lowercaseKeys(value);
//       return acc;
//     }, {});
//   }

//   return obj;
// };

const main = async () => {
  if (!input || !output) {
    console.error('Usage: node convert-config-to-yaml.js <input.json> <output.yaml>');
    process.exit(1);
  }

  const json = JSON.parse(readFileSync(input, 'utf8'));

  const yamlString = yaml.stringify(json, {
    prettyErrors: true,
    lineWidth: 1000,
    blockQuote: true,
  });

  writeFileSync(output, yamlString, 'utf8');
  console.log(`Converted ${input} to ${output}`);
};

main();
