const bifrost = require('../node-common/src/modules/bifrost');

const [server, to, topic, message] = process.argv.slice(2);

/**
 * The main function.
 */
const main = async () => {
  await bifrost.connect({ server });

  const res = await bifrost.send({
    to,
    topic,
    message: message ? JSON.parse(message) : undefined,
  });
  console.log(res);
  bifrost.disconnect();
};

main();
