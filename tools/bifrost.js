const bifrost = require('../node-common/src/modules/bifrost');

const [server, to, topic, message, toHostname] = process.argv.slice(2);

/**
 * The main function.
 */
const main = async () => {
  await bifrost.connect({ server });

  const packet = {
    to,
    topic,
    message: message ? JSON.parse(message) : undefined,
    toHostname: toHostname || undefined,
  };
  console.log(packet);
  const res = await bifrost.send(packet);
  console.log(res);
  bifrost.disconnect();
};

main();
