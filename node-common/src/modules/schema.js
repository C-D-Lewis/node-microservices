const { validate } = require('jsonschema');

module.exports = (instance, schema) => {
  const results = validate(instance, schema);
  if (!(results.errors && results.errors.length > 0)) {
    return true;
  }

  results.errors.forEach(item => console.log(`schema error: ${item.stack}`));
  console.log(`expected: ${JSON.stringify(schema)}`);
  console.log(`  actual: ${JSON.stringify(instance)}`);
  return false;
};
